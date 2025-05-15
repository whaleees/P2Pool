use anchor_lang::prelude::*;
use crate::state::*;

const MAX_TOKENS: usize = 15;
const MAX_COLLATERALS: usize = 15;

// Pool struct:
// - Vec<Pubkey>: 4 (len) + 32 * MAX_TOKENS
// - Vec<u64>: 4 + 8 * MAX_TOKENS
// - 2x u64 counter = 16 bytes

const POOL_SPACE: usize = 8  // discriminator
    + 4 + MAX_TOKENS * 8     // Vec<u64> pool_amount
    + 4 + MAX_TOKENS * 32    // Vec<Pubkey> token_mint
    + 8 + 8;                 // borrow_counter + deposit_counter

// CollateralReserve:
const COLLATERAL_SPACE: usize = 8
    + 4 + MAX_COLLATERALS * 8
    + 4 + MAX_COLLATERALS * 32
    + 8; // borrow_counter


#[derive(Accounts)]
pub struct InitPoolReserve<'info> {
    #[account(init, payer = payer, space = POOL_SPACE)]
    pub pool: Account<'info, Pool>,

    #[account(init, payer = payer, space = COLLATERAL_SPACE)]
    pub collateral_reserve: Account<'info, CollateralReserve>,
    
    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn init_pool_reserve_handler(ctx: Context<InitPoolReserve>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let collateral_reserve = &mut ctx.accounts.collateral_reserve;

    pool.pool_amount = Vec::new();
    pool.token_mint = Vec::new();
    pool.borrow_counter = 1;
    pool.deposit_counter = 1;
    
    collateral_reserve.collateral_amount = Vec::new();
    collateral_reserve.collateral_mint = Vec::new();

    Ok(())
}
