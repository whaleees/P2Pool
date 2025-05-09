use anchor_lang::prelude::*;

declare_id!("CmE7pzV3xp823iF8z2YEMXXTN8LBwMfBFh3AwDG4V7E9");

#[program]
pub mod contracts {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
