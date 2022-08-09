use anchor_lang::prelude::*;
//use anchor_spl::token::{self, Mint, SetAuthority, TokenAccount, Transfer};
use std::mem::size_of;

declare_id!("Cjn97wB2nmcrAeaTtMNSfAqNiVZdBhPLUd9pXDMHdagS");

#[program]
pub mod demo {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>
    ) -> Result<()> {
       
        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.initializer.key();
        Ok(())
    }

    // transfer native sol to vault
    pub fn transfer_vault(
        ctx: Context<TransferVault>,
        amount: u64,
    ) -> Result<()> {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.payer.key(),
            &ctx.accounts.vault.key(),
          
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.vault.to_account_info()
            ],
        )?;

        // update vault balance when increment
        let vault = &mut ctx.accounts.vault;
        vault.amount += amount;

        Ok(())
    }

    pub fn transfer_winner(ctx: Context<TransferWinner>) -> Result<()>  {
        // What is the data from game server
        
        // transfer from vault to winner
        let amount = ctx.accounts.vault.amount;
        //let mut amount : u64 = 10
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.winner.try_borrow_mut_lamports()? += amount;

        Ok(())
    }
}


#[derive(Accounts)]
pub struct InitializeVault<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut, signer)]
    pub initializer: AccountInfo<'info>,

    //pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = initializer,
        space = 8 + 32, 
        seeds = [b"vault", initializer.key().as_ref()], 
        bump
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>
}


#[account]
pub struct Vault {
    owner: Pubkey,
    amount : u64,
    // not sure if need any more members
}

#[derive(Accounts)]
pub struct TransferVault<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account

    #[account(mut, signer)]
    pub payer: AccountInfo<'info>,

    #[account(
        mut,
        constraint = vault.owner == payer.key()
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct TransferWinner<'info> {
  /// CHECK: This is not dangerous because we don't read or write from this account  
  #[account(mut, signer)]
  pub payer: AccountInfo<'info>,

  #[account(
    mut,
    constraint = vault.owner == payer.key()
  )]
  pub vault: Account<'info, Vault>,
  /// CHECK: This is not dangerous because we don't read or write from this account
  pub winner: AccountInfo<'info>,

  pub system_program: Program<'info, System>,
}