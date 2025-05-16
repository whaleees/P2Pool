use anchor_lang::prelude::*;
use crate::error::ErrorCode;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Duration {
    OneDay,
    ThreeDays,
    OneWeek,
    OneMonth,
}

impl Duration {
    pub fn as_days(&self) -> u64 {
        match self {
            Duration::OneDay => 1,
            Duration::ThreeDays => 3,
            Duration::OneWeek => 7,
            Duration::OneMonth => 30,
        }
    }
}

// Define the Pool struct (NOT P2P)
#[account]
pub struct Pool {
    pub pool_amount: Vec<u64>,          // amount of token in the pool
    pub token_mint: Vec<Pubkey>,        // token that lent
    pub borrow_counter: u64,
    pub deposit_counter: u64,
}

// Define the Pool Borrow scheme (NOT P2P)
#[account]
pub struct PoolBorrow {
    pub id: u64,        
    pub borrower_wallet: Pubkey,        // borrower wallet
    pub borrow_amount: u64,             // amount of token borrowed
    pub borrow_mint: Pubkey,            // mint of the token borrowed
    pub collateral_amount: u64,         // amount of collateral
    pub collateral_mint: Pubkey,        // mint of the collateral
    pub duration: Duration,
    pub interest_rate_borrowing: u64,   // interest rate borrowing
}

// Define the Pool Deposit scheme (NOT P2P)
#[account]
pub struct PoolDeposit {
    pub id: u64,
    pub lender_wallet: Pubkey,                  // lender wallet
    pub deposit_amount: u64,                    // amount of token deposited
    pub deposit_mint: Pubkey,                   // mint of the token deposited
    pub duration: Duration,
    pub interest_rate_lending: u64,             // interest rate lending
}

// Define the P2P
#[account]
pub struct P2P {
    pub id: u64,
    pub lender_wallet: Pubkey,          // lender wallet
    pub borrower_wallet: Pubkey,        // borrower wallet

    pub borrow_amount: u64,             // amount of token lent
    pub borrow_mint: Pubkey,            // mint of the token lent

    pub collateral_amount: u64,         // amount of collateral
    pub collateral_mint: Pubkey,        // mint of the collateral

    pub interest_rate_lending: u64,     // interest rate
    pub interest_rate_borrowing: u64,   // interest rate borrowing

    pub duration: Duration,
    pub repaid: bool,
    pub is_active: bool,
}

// Define the collateral reserve for both pool and p2p
#[account]
pub struct CollateralReserve {
    pub collateral_amount: Vec<u64>,     // amount of collateral
    pub collateral_mint: Vec<Pubkey>,    // mint of the collateral
}

// Define pyth struct to fetch the price
#[account]
pub struct PythMapping {
    pub token_mint: Pubkey,
    pub pyth_token_mint: Pubkey,
}


impl Pool {
    pub fn deposit(&mut self, mint: Pubkey, amount: u64) -> Result<()> {
        match self
            .token_mint
            .iter()
            .position(|&m| m == mint) {
                Some(index) => {
                    self.pool_amount[index] = self
                        .pool_amount[index]
                        .checked_add(amount)
                        .ok_or(ErrorCode::MathOverflow)?;
                }
                None => {
                    return Err(error!(ErrorCode::TokenNotFound));
                }
            }
        Ok(())
    }

    pub fn borrow(&mut self, mint: Pubkey, amount: u64) -> Result<()> {
        match self
            .token_mint
            .iter()
            .position(|&m| m == mint) {
                Some(index) => {
                    require!(
                        self.pool_amount[index] >= amount,
                        ErrorCode::InsufficientFunds
                    );

                    self.pool_amount[index] = self
                        .pool_amount[index]
                        .checked_sub(amount)
                        .ok_or(ErrorCode::MathOverflow)?;
                }
                None => {
                    return Err(error!(ErrorCode::TokenNotFound));
                }
            }
        Ok(())
    }
}

impl CollateralReserve {
    pub fn add_collateral(&mut self, mint: Pubkey, amount: u64) -> Result<()> {
        match self
            .collateral_mint
            .iter()
            .position(|&m| m == mint) {
                Some(index) => {
                    self.collateral_amount[index] = self
                        .collateral_amount[index]
                        .checked_add(amount)
                        .ok_or(ErrorCode::MathOverflow)?;
                }
                None => {
                    return Err(error!(ErrorCode::TokenNotFound));
                }
            }
        Ok(())
    }

    pub fn remove_collateral(&mut self, mint: Pubkey, amount: u64) -> Result<()> {
        match self
            .collateral_mint
            .iter()
            .position(|&m| m == mint) {
                Some(index) => {
                    self.collateral_amount[index] = self
                        .collateral_amount[index]
                        .checked_sub(amount)
                        .ok_or(ErrorCode::MathOverflow)?;
                }
                None => {
                    return Err(error!(ErrorCode::TokenNotFound));
                }
            }
        Ok(())
    }
}