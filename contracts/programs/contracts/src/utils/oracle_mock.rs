use anchor_lang::prelude::*;

#[error_code]
pub enum OracleMockError {
    #[msg("Unknown token feed ID")]
    UnknownTokenFeed,
}

pub fn get_mock_price(feed_id: &str) -> Result<i64> {
    match feed_id {
        "btc" => Ok(60_000_000),   // $60,000.0000 (with 6 decimals)
        "eth" => Ok(3_000_000),    // $3,000.0000
        "usdc" => Ok(1_000_000),   // $1.0000
        "sol" => Ok(10_000_000),   // $10.0000
        _ => Err(OracleMockError::UnknownTokenFeed.into()),
    }
}
