use anchor_lang::prelude::*;
use crate::state::*;

#[event]
pub struct DepositEvent {
    pub lender: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub deposit_id: u64,
}

#[event]
pub struct BorrowEvent {
    pub borrower: Pubkey,
    pub borrow_mint: Pubkey,
    pub borrow_amount: u64,
    pub collateral_mint: Pubkey,
    pub collateral_amount: u64,
    pub borrow_id: u64,
}

#[event]
pub struct RepayEvent {
    pub borrower: Pubkey,
    pub repay_mint: Pubkey,
    pub repay_amount: u64,
    pub borrow_id: u64,
    pub collateral_released: bool,
}

#[event]
pub struct LiquidationEvent {
    pub borrower: Pubkey,
    pub liquidator: Pubkey,
    pub collateral_mint: Pubkey,
    pub collateral_amount: u64,
    pub borrow_amount: u64,
    pub borrow_id: u64,
}

#[event]
pub struct P2POffered {
    pub lender: Pubkey,
    pub borrow_mint: Pubkey,
    pub borrow_amount: u64,
    pub collateral_mint: Pubkey,
    pub collateral_amount: u64,
    pub interest_rate: u64,
    pub duration: Duration,
    pub p2p_id: u64,
}

#[event]
pub struct P2PAccepted {
    pub lender: Pubkey,
    pub borrower: Pubkey,
    pub borrow_mint: Pubkey,
    pub borrow_amount: u64,
    pub collateral_mint: Pubkey,
    pub collateral_amount: u64,
    pub p2p_id: u64,
}
