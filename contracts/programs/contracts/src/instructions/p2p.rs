use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct P2P<'info> {
    #[account(mut)]
    pub p2p: Account<'info, P2P>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn p2p_handler(ctx: Context<P2P>, id: u64) -> Result<()> {
    let p2p = &mut ctx.accounts.p2p;

    
}