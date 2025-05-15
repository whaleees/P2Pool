use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;
use crate::utils::transfer_token::{transfer_tokens, transfer_from_pool_to_user};
use anchor_spl::token::{Token, TokenAccount};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct Repay<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,

    #[account(mut)]
    pub borrower: Signer<'info>,

    #[account(
        mut,
        seeds = [b"borrow", borrower.key().as_ref(), &id.to_le_bytes()],
        bump,
        constraint = pool_borrow.borrower_wallet == borrower.key() @ ErrorCode::UnauthorizedAccess,
    )]
    pub pool_borrow: Account<'info, PoolBorrow>,

    #[account(mut)]
    pub collateral_reserve: Account<'info, CollateralReserve>,

    #[account(
        mut,
        constraint = borrower_token_account.owner == borrower.key() @ ErrorCode::UnauthorizedAccess,
    )]
    pub borrower_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = reserve_token_account.owner == pool_signer.key() @ ErrorCode::UnauthorizedAccess,
    )]
    pub reserve_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = pool_token_account.owner == pool_signer.key() @ ErrorCode::UnauthorizedAccess,
    )]
    pub pool_token_account: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"pool_signer", pool.key().as_ref()],
        bump
    )]
    pub pool_signer: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,


    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn repay_handler(
    ctx: Context<Repay>,
    repay_token: Pubkey,
    repay_amount: u64,
    collateral_token: Pubkey,
    id: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let pool_borrow = &mut ctx.accounts.pool_borrow;
    let collateral_reserve = &mut ctx.accounts.collateral_reserve;
    let borrower = ctx.accounts.borrower.key();
    let bump = *ctx.bumps.get("pool_signer").ok_or(ErrorCode::MissingBump)?; // bikin ErrorCode sendiri jika perlu

    require!(pool_borrow.borrower_wallet == borrower, ErrorCode::UnauthorizedAccess);
    require!(pool_borrow.borrow_mint == repay_token, ErrorCode::InvalidToken);
    require!(pool_borrow.collateral_mint == collateral_token, ErrorCode::InvalidToken);
    require!(repay_amount == pool_borrow.borrow_amount, ErrorCode::InvalidAmount);
    require!(repay_amount > 0, ErrorCode::InvalidAmount);

    transfer_tokens(
        ctx.accounts.borrower_token_account.to_account_info(),
        ctx.accounts.pool_token_account.to_account_info(),
        ctx.accounts.borrower.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        repay_amount,
    )?;

    pool.deposit(
        repay_token, 
        repay_amount,
    );

    pool_borrow.borrow_amount = pool_borrow
        .borrow_amount
        .checked_sub(repay_amount)
        .ok_or(ErrorCode::MathOverflow)?;

    if pool_borrow.borrow_amount == 0 {
        let bump = *ctx.bumps.get("pool_signer").unwrap();
        let signer_seeds: &[&[&[u8]]] = &[&[b"pool_signer", pool.key().as_ref(), &[bump]]];

        transfer_from_pool_to_user(
            ctx.accounts.reserve_token_account.to_account_info(),
            ctx.accounts.borrower_token_account.to_account_info(),
            ctx.accounts.pool_signer.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            pool_borrow.collateral_amount,
            signer_seeds,
        )?;

        collateral_reserve.remove_collateral(
            pool_borrow.collateral_mint,
            pool_borrow.collateral_amount,
        )?;
    }

    Ok(())
}