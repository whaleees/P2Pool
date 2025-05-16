use anchor_lang::prelude::*;
use crate::state::*;
use crate::event::*;
use crate::error::ErrorCode;
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};
use crate::utils::transfer_token::{transfer_from_pool_to_user};
use anchor_spl::token::{Token, TokenAccount};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct Liquidate<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,

    #[account(mut)]
    pub liquidator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"borrow", pool_borrow.borrower_wallet.as_ref(), &id.to_le_bytes()],
        bump,
        constraint = pool_borrow.borrow_amount > 0 @ ErrorCode::InvalidAmount,
    )]
    pub pool_borrow: Account<'info, PoolBorrow>,

    #[account(
        mut,
        constraint = reserve_token_account.mint == pool_borrow.collateral_mint @ ErrorCode::InvalidToken,
        constraint = reserve_token_account.owner == pool_signer.key() @ ErrorCode::UnauthorizedAccess
    )]
    pub reserve_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = liquidator_token_account.mint == pool_borrow.collateral_mint @ ErrorCode::InvalidToken,
        constraint = liquidator_token_account.owner == liquidator.key() @ ErrorCode::UnauthorizedAccess
    )]
    pub liquidator_token_account: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"pool_signer", pool.key().as_ref()],
        bump
    )]
    pub pool_signer: AccountInfo<'info>,
    
    #[account(mut)]
    pub collateral_reserve: Account<'info, CollateralReserve>,
    
    pub collateral_price_feed: Account<'info, PriceUpdateV2>,
    pub borrow_price_feed: Account<'info, PriceUpdateV2>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn liquidate_handler(
    ctx: Context<Liquidate>,
    id: u64,
) -> Result<()> {
    let pool_borrow = &mut ctx.accounts.pool_borrow;
    let collateral_reserve = &mut ctx.accounts.collateral_reserve;
    let pool_key = ctx.accounts.pool.key();

    let bump = *ctx.bumps.get("pool_signer").ok_or(ErrorCode::MissingBump)?; 
    let signer_seeds: &[&[&[u8]]] = &[&[b"pool_signer", pool_key.as_ref(), &[bump]]];


    require!(
        pool_borrow.borrow_amount > 0,
        ErrorCode::AlreadyRepaid
    );

    let collateral_price_update = &mut ctx.accounts.collateral_price_feed;
    let borrow_price_update = &mut ctx.accounts.borrow_price_feed;

    let collateral_feed: [u8; 32] = get_feed_id_from_hex("0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43")?;
    let borrow_feed: [u8; 32] = get_feed_id_from_hex("0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43")?;

    let collateral_price = collateral_price_update.get_price_no_older_than(
        collatteral_price_update,
        30,
        &collateral_feed,
    )? as u64;

    let borrow_price = borrow_price_update.get_price_no_older_than(
        borrow_price_update,
        30,
        &borrow_feed,
    )? as u64;

    // calculate threshold >= 150%
    let liquidation_threshold = borrow_price.price
        .checked_mul(150)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(100)
        .ok_or(ErrorCode::MathOverflow)?;

    require!(
        collateral_price.price < liquidation_threshold,
        ErrorCode::StillHealthy
    );

    collateral_reserve.remove_collateral(
        pool_borrow.collateral_mint,
        pool_borrow.collateral_amount,
    )?;

    transfer_from_pool_to_user(
        ctx.accounts.reserve_token_account.to_account_info(),
        ctx.accounts.liquidator_token_account.to_account_info(),
        ctx.accounts.pool_signer.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        pool_borrow.collateral_amount,
        signer_seeds,
    )?;

    pool_borrow.borrow_amount = 0;

    emit!(LiquidationEvent {
        borrower: pool_borrow.borrower_wallet,
        liquidator: ctx.accounts.liquidator.key(),
        collateral_mint: pool_borrow.collateral_mint,
        collateral_amount: pool_borrow.collateral_amount,
        borrow_amount: pool_borrow.borrow_amount,
        borrow_id: id,
    });

    Ok(())
}