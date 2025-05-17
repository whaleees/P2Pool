use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};
use crate::state::*;
use crate::event::*;
use crate::error::ErrorCode;
use crate::utils::oracle_mock::*;
use crate::utils::transfer_token::*;

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
    
    #[account(mut, constraint = reserve_token_account.owner == pool_signer.key() @ ErrorCode::UnauthorizedAccess,)]
    pub reserve_token_account: Account<'info, TokenAccount>,
    
    #[account(mut, constraint = borrower_token_account.owner == borrower.key() @ ErrorCode::UnauthorizedAccess,)]
    pub borrower_token_account: Account<'info, TokenAccount>,
    
    #[account(mut, constraint = pool_token_account.owner == pool_signer.key() @ ErrorCode::UnauthorizedAccess,)]
    pub pool_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    
    /// CHECK: This is a PDA signer derived from the pool. Verified by seeds and bump.
    #[account(seeds = [b"pool_signer", pool.key().as_ref()], bump)]
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
    borrow_feed_id: String,
    collateral_feed_id: String,
    duration: Duration,
) -> Result<()> {
    let pool_key = ctx.accounts.pool.key();
    let pool = &mut ctx.accounts.pool;
    let pool_borrow = &mut ctx.accounts.pool_borrow;
    let collateral_reserve = &mut ctx.accounts.collateral_reserve;
    let bump = ctx.bumps.pool_signer; 
    let signer_seeds = &[b"pool_signer", pool_key.as_ref(), &[bump]];

    //get mocked prices
    let borrow_price = get_mock_price(&borrow_feed_id)? as u64;
    let collateral_price = get_mock_price(&collateral_feed_id)? as u64;
       
    // threshold is 120% of the borrow value
    let required_threshold = borrow_price
        .checked_mul(120)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(100)
        .ok_or(ErrorCode::MathOverflow)?;

    // the collateral amount must be greater than borrow amount
    require!(
        collateral_price == required_threshold,
        ErrorCode::Undercollateralized
    );
    
    pool_borrow.id = id;
    pool_borrow.borrower_wallet = ctx.accounts.borrower.key();
    pool_borrow.borrow_amount = borrow_amount;
    pool_borrow.borrow_mint = borrow_token;
    pool_borrow.collateral_amount = collateral_amount;
    pool_borrow.collateral_mint = collateral_token;
    pool_borrow.duration = duration;
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

    emit!(BorrowEvent {
        borrower: ctx.accounts.borrower.key(),
        borrow_mint: borrow_token,
        borrow_amount,
        collateral_mint: collateral_token,
        collateral_amount,
        borrow_id: id,
    });

    Ok(())
}