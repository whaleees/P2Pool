use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};

// authority = regular wallet
pub fn transfer_tokens<'info>(
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    let cpi_accounts = Transfer {
        from,
        to,
        authority,
    };
    let cpi_ctx = CpiContext::new(token_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)
}

// transfer from PDA
pub fn transfer_from_pool_to_user<'info>(
    pool_token_account: AccountInfo<'info>,
    borrower_token_account: AccountInfo<'info>,
    pool_signer: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    amount: u64,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let cpi_accounts = Transfer {
        from: pool_token_account,
        to: borrower_token_account,
        authority: pool_signer,
    };
    let cpi_ctx = CpiContext::new_with_signer(token_program, cpi_accounts, signer_seeds);
    token::transfer(cpi_ctx, amount)
}