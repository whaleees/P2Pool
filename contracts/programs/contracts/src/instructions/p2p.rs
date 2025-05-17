use anchor_lang::prelude::*;
use crate::state::*;
use crate::event::*;
use crate::error::ErrorCode;
use crate::utils::transfer_token::{transfer_tokens, transfer_from_pool_to_user};
use anchor_spl::token::{Token, TokenAccount};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct OfferP2P<'info> {
    #[account(
        init,
        seeds = [b"p2p", lender.key().as_ref(), &id.to_le_bytes()],
        bump,
        payer = payer,
        space = 8 + std::mem::size_of::<P2P>()
    )]
    pub p2p: Account<'info, P2P>,

    #[account(mut)]
    pub lender: Signer<'info>,

    #[account(
        mut,
        constraint = lender_token_account.owner == lender.key() @ ErrorCode::UnauthorizedAccess,
    )]
    pub lender_token_account: Account<'info, TokenAccount>,

    /// CHECK: This is a PDA signer derived from the pool. Verified by seeds and bump.
    #[account(
        seeds = [b"pool_signer", pool.key().as_ref()],
        bump
    )]
    pub pool_signer: AccountInfo<'info>,

    #[account(mut)]
    pub pool: Account<'info, Pool>,

    #[account(
        mut,
        constraint = pool_token_account.owner == pool_signer.key() @ ErrorCode::UnauthorizedAccess,
    )]
    pub pool_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn offer_p2p_handler(
    ctx: Context<OfferP2P>,
    id: u64,
    borrow_token: Pubkey,
    borrow_amount: u64,
    collateral_token: Pubkey,
    collateral_amount: u64,
    interest_rate: u64,
    duration: Duration,
) -> Result<()> {
    let p2p = &mut ctx.accounts.p2p;

    p2p.id = id;
    p2p.lender_wallet = ctx.accounts.lender.key();
    p2p.borrower_wallet = Pubkey::default();
    p2p.borrow_amount = borrow_amount;
    p2p.borrow_mint = borrow_token;
    p2p.collateral_amount = collateral_amount;
    p2p.collateral_mint = collateral_token;
    p2p.interest_rate_lending = interest_rate;
    p2p.interest_rate_borrowing = interest_rate;
    p2p.duration = duration;
    p2p.repaid = false;
    p2p.is_active = true;

    transfer_tokens(
        ctx.accounts.lender_token_account.to_account_info(),
        ctx.accounts.pool_token_account.to_account_info(),
        ctx.accounts.lender.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        borrow_amount,
    )?;

    emit!(P2POffered {
        lender: ctx.accounts.lender.key(),
        borrow_mint: borrow_token,
        borrow_amount,
        collateral_mint: collateral_token,
        collateral_amount,
        interest_rate,
        duration,
        p2p_id: id,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct AcceptP2P<'info> {
    #[account(mut)]
    pub p2p: Account<'info, P2P>,

    #[account(mut)]
    pub borrower: Signer<'info>,

    #[account(mut)]
    pub collateral_reserve: Account<'info, CollateralReserve>,

    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub borrower_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub borrower_collateral_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub reserve_token_account: Account<'info, TokenAccount>,

    /// CHECK: This is a PDA signer derived from the pool. Verified by seeds and bump.
    #[account(
        seeds = [b"pool_signer", pool.key().as_ref()],
        bump
    )]
    pub pool_signer: AccountInfo<'info>,

    #[account(mut)]
    pub pool: Account<'info, Pool>,

    pub token_program: Program<'info, Token>,
}

pub fn accept_p2p_handler(ctx: Context<AcceptP2P>, id: u64) -> Result<()> {
    let p2p = &mut ctx.accounts.p2p;

    require!(p2p.is_active, ErrorCode::OfferNotActive);
    require!(p2p.borrow_amount > 0, ErrorCode::InvalidAmount);

    // Transfer lending token to borrower
    let bump = ctx.bumps.pool_signer;
    let pool_key = ctx.accounts.pool.key();
    let signer_seeds: &[&[&[u8]]] = &[&[b"pool_signer", pool_key.as_ref(), &[bump]]];

    transfer_from_pool_to_user(
        ctx.accounts.pool_token_account.to_account_info(),
        ctx.accounts.borrower_token_account.to_account_info(),
        ctx.accounts.pool_signer.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        p2p.borrow_amount,
        signer_seeds,
    )?;

    transfer_tokens(
        ctx.accounts.borrower_collateral_account.to_account_info(),
        ctx.accounts.reserve_token_account.to_account_info(),
        ctx.accounts.borrower.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        p2p.collateral_amount,
    )?;

    ctx.accounts.collateral_reserve.add_collateral(p2p.collateral_mint, p2p.collateral_amount)?;
    p2p.borrower_wallet = ctx.accounts.borrower.key();
    p2p.is_active = false;

    emit!(P2PAccepted {
        lender: p2p.lender_wallet,
        borrower: ctx.accounts.borrower.key(),
        borrow_mint: p2p.borrow_mint,
        borrow_amount: p2p.borrow_amount,
        collateral_mint: p2p.collateral_mint,
        collateral_amount: p2p.collateral_amount,
        p2p_id: id,
    });

    Ok(())
}
