use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct InitPythMapping<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 32,
        seeds = [b"pythmapping", token_mint.key().as_ref()],
        bump
    )]
    pub pyth_mapping: Account<'info, PythMapping>

    pub token_mint: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>
    pub system_program: Program<'info, System>,
}

pub fn init_pyth_mapping(ctx: Context<InitPythMapping>, pyth_token_mint: Pubkey) -> Result<()> {
    let mapping = &mut ctx.accounts.pyth_mapping;
    mapping.token_mint = *ctx.accounts.token_mint.key();
    mapping.pyth_token_mint = pyth_token_mint;
    Ok(())
}