use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;
use pyth_sdk_solana::{load_price_feed_from_account_info};
use pyth_sdk_solana::state::PriceFeed;
use anchor_spl::token::{Token, TokenAccount};
use crate::utils::transfer_token::{transfer_tokens, transfer_from_pool_to_user};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,

    #[account(mut)]
    pub borrower: Signer<'info>,

    #[account(
        init, 
        seeds = [b"borrow", borrower.key().as_ref(), &id.to_le_bytes()],
        bump,
        payer = payer,
        space = 8 + std::mem::size_of::<PoolBorrow>()
    )]
    pub pool_borrow: Account<'info, PoolBorrow>,

    #[account(init, payer = payer, space = 8 + std::mem::size_of::<CollateralReserve>())]
    pub collateral_reserve: Account<'info, CollateralReserve>,

    pub collateral_price_feed: AccountInfo<'info>,
    pub borrow_price_feed: AccountInfo<'info>,

    #[account(
        mut,
        // constraint = reserve_token_account.mint == collateral_token @ ErrorCode::InvalidToken,
        constraint = reserve_token_account.owner == pool_signer.key() @ ErrorCode::UnauthorizedAccess,
    )]
    pub reserve_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        // constraint = borrower_token_account.mint == borrow_token @ ErrorCode::InvalidToken,
        constraint = borrower_token_account.owner == borrower.key() @ ErrorCode::UnauthorizedAccess,
    )]
    pub borrower_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        // constraint = pool_token_account.mint == borrow_token @ ErrorCode::InvalidToken,
        constraint = pool_token_account.owner == pool_signer.key() @ ErrorCode::UnauthorizedAccess,
    )]
    pub pool_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    #[account(
        seeds = [b"pool_signer", pool.key().as_ref()],
        bump
    )]
    pub pool_signer: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn borrow_handler(
    ctx: Context<Borrow>, 
    borrow_token: Pubkey, 
    borrow_amount: u64, 
    collateral_token: Pubkey, 
    collateral_amount: u64,
    id: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let pool_borrow = &mut ctx.accounts.pool_borrow;
    let collateral_reserve = &mut ctx.accounts.collateral_reserve;
    let pool_key = ctx.accounts.pool.key();
    let bump = *ctx.bumps.get("pool_signer").ok_or(ErrorCode::MissingBump)?; 
    let signer_seeds = &[b"pool_signer", pool_key.as_ref(), &[bump]];

    //load collateral and borrow price feeds
    let collateral_feed: PriceFeed = load_price_feed_from_account_info(
        &ctx.accounts.collateral_price_feed
    ).unwrap();
    let borrow_feed: PriceFeed = load_price_feed_from_account_info(
        &ctx.accounts.borrow_price_feed
    ).unwrap();

    // get the price from feed
    let collateral_price = collateral_feed
        .get_current_price()
        .ok_or(ErrorCode::InvalidPriceFeed)?
        .price() as u64;
        
    let borrow_price = borrow_feed
        .get_current_price()
        .ok_or(ErrorCode::InvalidPriceFeed)?
        .price() as u64;

    // get the price in usd
    let collateral_value = collateral_amount
        .checked_mul(collateral_price)
        .ok_or(ErrorCode::MathOverflow)?;

    let borrow_value = borrow_amount
        .checked_mul(borrow_price)
        .ok_or(ErrorCode::MathOverflow)?;
       
    // threshold is 120% of the borrow value
    let required_threshold = borrow_value
        .checked_mul(120)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(100)
        .ok_or(ErrorCode::MathOverflow)?;

    // the collateral amount must be greater than borrow amount
    require!(
        collateral_amount == required_threshold,
        ErrorCode::Undercollateralized
    );
    
    pool_borrow.id = id;
    pool_borrow.borrower_wallet = ctx.accounts.borrower.key();
    pool_borrow.borrow_amount = borrow_amount;
    pool_borrow.borrow_mint = borrow_token;
    pool_borrow.collateral_amount = collateral_amount;
    pool_borrow.collateral_mint = collateral_token;
    pool_borrow.borrowed_at = Clock::get()?.unix_timestamp as u64;
    pool_borrow.interest_rate_borrowing = 5_00;
    
    pool.borrow_counter = pool.borrow_counter
    .checked_add(1)
    .ok_or(ErrorCode::MathOverflow)?;
    
    transfer_from_pool_to_user(
        ctx.accounts.pool_token_account.to_account_info(),          //from
        ctx.accounts.borrower_token_account.to_account_info(),      //to
        ctx.accounts.pool_signer.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        borrow_amount,
        &[signer_seeds],
    )?;
    
    transfer_tokens(
        ctx.accounts.borrower_token_account.to_account_info(),
        ctx.accounts.reserve_token_account.to_account_info(),
        ctx.accounts.borrower.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        collateral_amount,
    )?;
    
    pool.borrow(
        borrow_token,
        borrow_amount,
    )?;
    
    collateral_reserve.add_collateral(
        collateral_token,
        collateral_amount,
    )?;

    Ok(())
}