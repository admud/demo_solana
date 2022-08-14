use anchor_lang::prelude::*;
//use anchor_spl::token::{self, Mint, SetAuthority, TokenAccount, Transfer};
use std::mem::size_of;

declare_id!("7xd5qmpcKx3BPRJZLduGmvjxSXPoDuTFBHt9UDMBVCjH");

#[program]
pub mod test {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>
    ) -> Result<()> {
       
        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.initializer.key();
        vault.amount = 0;
        
        Ok(())
    }
    
    pub fn transfer_sol(
        ctx: Context<TransferSol>,
        
        amount: u64,
    ) -> Result<()> {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.from.key(),
            &ctx.accounts.to.key(),
          
            amount ,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.from.to_account_info(),
                ctx.accounts.to.to_account_info()
            ],
        )?;
        
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
          
            amount ,
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
        
        // update vault balance when increment

        let vault = &mut ctx.accounts.vault;
        vault.amount += amount;

        Ok(())
    }

    pub fn transfer_winner(ctx: Context<TransferWinner>, lamports : u64) -> Result<()>  {
        // What is the data from game server

        let to_transfer = lamports;
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

        //vault.amount = 0;
        // what is null empty pubkey type or overwrite
        /*
        vault.winner =  0;
        vault.players[0] =  0;
        vault.players[1] =  0;
        */
        Ok(())
    }

    pub fn transfer_native_sol(ctx: Context<Transfer>, amount:u64) -> Result<()> {
        
        let from = ctx.accounts.from.to_account_info();
        let to = ctx.accounts.to.to_account_info();

        // Debit from_account and credit to_account
        **from.try_borrow_mut_lamports()? -= amount;
        **to.try_borrow_mut_lamports()? += amount;

        Ok(())
    }

}


#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    //pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = initializer,
        space = 9000, 
        seeds = [b"vault".as_ref(), initializer.key().as_ref()], 
        bump
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}


#[account]
// #[derive(Default)]
pub struct Vault {
    pub owner: Pubkey,
    pub amount : u64,
    // not sure if need any more members, maybe should separate into game instance
    //players: [Pubkey; 2],
    //winner: Pubkey,
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

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut,signer)]
    /// CHECK: This is not dangerous
    pub from: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we just pay to this account
    pub to: AccountInfo<'info>,
    
    //#[account()]
    //pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferSol<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account

    #[account(mut, signer)]
    pub from: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub to: AccountInfo<'info>,

    pub system_program: Program<'info, System>
}