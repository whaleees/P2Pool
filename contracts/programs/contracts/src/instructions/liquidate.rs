use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};
use crate::state::*;
use crate::event::*;
use crate::error::ErrorCode;
use crate::utils::transfer_token::*;
use crate::utils::oracle_mock::*;

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
    
    /// CHECK: This is a PDA signer derived from the pool. Verified by seeds and bump.
    #[account(
        seeds = [b"pool_signer", pool.key().as_ref()],
        bump
    )]
    pub pool_signer: AccountInfo<'info>,
    
    #[account(mut)]
    pub collateral_reserve: Account<'info, CollateralReserve>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn liquidate_handler(
    ctx: Context<Liquidate>,
    id: u64,
    borrow_feed_id: String,
    collateral_feed_id: String,
) -> Result<()> {
    let pool_borrow = &mut ctx.accounts.pool_borrow;
    let collateral_reserve = &mut ctx.accounts.collateral_reserve;
    let pool_key = ctx.accounts.pool.key();
    let bump = ctx.bumps.pool_signer; 
    let signer_seeds: &[&[&[u8]]] = &[&[b"pool_signer", pool_key.as_ref(), &[bump]]];


    require!(
        pool_borrow.borrow_amount > 0,
        ErrorCode::AlreadyRepaid
    );

   let borrow_price = get_mock_price(&borrow_feed_id)? as u64;
   let collateral_price = get_mock_price(&collateral_feed_id)? as u64;

    let borrow_price = borrow_price
        .checked_mul(pool_borrow.borrow_amount)
        .ok_or(ErrorCode::MathOverflow)?;

    let collateral_price = collateral_price
        .checked_mul(pool_borrow.collateral_amount)
        .ok_or(ErrorCode::MathOverflow)?;

    // calculate threshold >= 150%
    let liquidation_threshold = borrow_price
        .checked_mul(150)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(100)
        .ok_or(ErrorCode::MathOverflow)?;

    require!(
        collateral_price < liquidation_threshold,
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