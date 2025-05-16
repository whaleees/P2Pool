use anchor_lang::prelude::*;
use crate::state::*;
use crate::event::*;
use crate::error::ErrorCode;
use crate::utils::transfer_token::{transfer_tokens};
use anchor_spl::token::{Token, TokenAccount};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct Deposit<'info>{
    #[account(mut)]
    pub pool: Account<'info, Pool>,

    #[account(mut)]
    pub lender: Signer<'info>,

    #[account(
        init, 
        payer = payer, 
        space = 8 + std::mem::size_of::<PoolDeposit>(),
        seeds = [b"deposit", lender.key().as_ref(), &id.to_le_bytes()],
        bump,
    )]
    pub pool_deposit: Account<'info, PoolDeposit>,

    #[account(
        mut,
        constraint = lender_token_account.owner == lender.key() @ ErrorCode::UnauthorizedAccess,
    )]
    pub lender_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = pool_token_account.owner == pool_signer.key() @ ErrorCode::UnauthorizedAccess,
    )]
    pub pool_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,

    #[account(
        seeds = [b"pool_signer", pool.key().as_ref()],
        bump
    )]
    pub pool_signer: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn deposit_handler(
    ctx: Context<Deposit>, 
    lent_token: Pubkey, 
    lent_amount: u64,
    id: u64,
) -> Result<()>{
    require!(
        lent_amount > 0,
        ErrorCode::InvalidAmount
    );

    let pool = &mut ctx.accounts.pool;
    let pool_deposit = &mut ctx.accounts.pool_deposit;
    let bump = *ctx.bumps.get("pool_signer").ok_or(ErrorCode::MissingBump)?; 

    require!(
        ctx.accounts.lender_token_account.mint == lent_token,
        ErrorCode::InvalidToken
    );
    require!(
        ctx.accounts.pool_token_account.mint == lent_token,
        ErrorCode::InvalidToken
    );
    
    pool_deposit.id = id;
    pool_deposit.lender_wallet = ctx.accounts.lender.key();
    pool_deposit.deposit_amount = lent_amount;
    pool_deposit.deposit_mint = lent_token;
    pool_deposit.interest_rate_lending = 5_00;
    
    pool.deposit_counter = pool.deposit_counter
    .checked_add(1)
    .ok_or(ErrorCode::MathOverflow)?;
    
    transfer_tokens(
        ctx.accounts.lender_token_account.to_account_info(),
        ctx.accounts.pool_token_account.to_account_info(),
        ctx.accounts.lender.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        lent_amount,
    )?;

    pool.deposit(
        lent_token,
        lent_amount,
    )?;

    emit!(DepositEvent {
        lender: ctx.accounts.borrower.key(),
        token_mint: lent_token,
        lent_amount,
        deposit_id: id,
    });


    Ok(())
}