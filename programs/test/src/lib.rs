use anchor_lang::prelude::*;
//use anchor_spl::token::{self, Mint, SetAuthority, TokenAccount, Transfer};
use std::mem::size_of;

declare_id!("3joWEmJ4LkanMRPR5yFqXKU3zoy41kkw6mGjc8crpV55");

#[program]
pub mod test {
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

        /*
        invoke(
            &sol_transfer,
            &[
                ctx.accounts.from.clone(),
                ctx.accounts.to.clone(),
                ctx.accounts.system_program.clone(),
            ],
        )?;
         */
        
    /*
       

    */


        // update vault balance when increment
        let vault = &mut ctx.accounts.vault;
        vault.amount += amount;

        Ok(())
    }

    pub fn transfer_winner(ctx: Context<TransferWinner>, address : String) -> Result<()>  {
        // What is the data from game server
        
        // transfer from vault to winner
        let amount = ctx.accounts.vault.amount;
        //let mut amount : u64 = 10
        // transfer program owned account to any other account
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.winner.try_borrow_mut_lamports()? += amount;

        Ok(())
    }

    pub fn reset_vault(ctx: Context<ResetVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.amount = 0;
        // what is null empty pubkey type or overwrite
        /*
        vault.winner =  0;
        vault.players[0] =  0;
        vault.players[1] =  0;
        */
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
        space = 1000, 
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
    // not sure if need any more members, maybe should separate into game instance
    players: [Pubkey; 2],
    winner: Pubkey,
}

#[derive(Accounts)]
pub struct TransferVault<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account

    #[account(mut, signer)]
    pub payer: AccountInfo<'info>,

    #[account(mut)]
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
  #[account(mut)]
  pub winner: AccountInfo<'info>,

  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResetVault<'info> {
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