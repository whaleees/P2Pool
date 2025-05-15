use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod error;
pub mod utils;

use instructions::*;

declare_id!("CmE7pzV3xp823iF8z2YEMXXTN8LBwMfBFh3AwDG4V7E9");

#[program]
pub mod contracts {
    use super::*;

    pub fn deposit(ctx: Context<Deposit>, lent_token: Pubkey, lent_amount: u64, id: u64) -> Result<()> {
        deposit_handler(ctx, lent_token, lent_amount, id)
    }

    pub fn borrow(ctx: Context<Borrow>, borrow_token: Pubkey, borrow_amount: u64, collateral_token: Pubkey, collateral_amount: u64, id: u64) -> Result<()> {
        borrow_handler(ctx, borrow_token, borrow_amount, collateral_token, collateral_amount, id)
    }

    pub fn repay(ctx: Context<Repay>, repay_token: Pubkey, repay_amount: u64, collateral_token: Pubkey, id: u64) -> Result<()> {
        repay_handler(ctx, repay_token, repay_amount, collateral_token, id)
    }

    pub fn liquidate(ctx: Context<Liquidate>, id: u64) -> Result<()> {
        liquidate_handler(ctx, id)
    }

    pub fn init_pool_reserve(ctx: Context<InitPoolReserve>) -> Result<()> {
        init_pool_reserve_handler(ctx)
    }
}
