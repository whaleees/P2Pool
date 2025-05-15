use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode{
    #[msg("Math overflow error")]
    MathOverflow,
    #[msg("Invalid token mint")]
    InvalidTokenMint,
    #[msg("Invalid token account")]
    InvalidTokenAccount,
    #[msg("Invalid price feed")]
    InvalidPriceFeed,
    #[msg("Unauthorized access")]
    UnauthorizedAccess,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Invalid account state")]
    InvalidAccountState,
    #[msg("Insufficient collateral provided.")]
    Undercollateralized,
    #[msg("Price not found in oracle")]
    PriceNotFound,
    #[msg("Collateral ratio is still healthy")] 
    StillHealthy,
    #[msg("Token still not added to the pool yet")] 
    TokenNotFound,
    #[msg("Token still not added to the pool yet")] 
    InvalidToken,
    #[msg("Invalid amount")] 
    InvalidAmount,
    #[msg("Already repaid")] 
    AlreadyRepaid,
    #[msg("Bump is missing!!")] 
    MissingBump,
}