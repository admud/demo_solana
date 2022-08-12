import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Test } from "../target/types/test";
import {
  Connection,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
const assert = require("assert");

describe("test", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider)
  //anchor.setProvider(anchor.AnchorProvider.env());
  const connection = anchor.getProvider().connection;
  const program = anchor.workspace.Test as Program<Test>;

  //const signer = anchor.web3.Keypair.fromSecretKey()
  it('init vault', async () => {
    const vaultKeyPair = anchor.web3.Keypair.generate()
    const testAddress = anchor.web3.Keypair.generate()
    
    const balance = await connection.getBalance(testAddress.publicKey)
    console.log('START')
    console.log(balance)
    
    // airdrop 1 SOL
    // localnet airdrop not working
    const temp = await connection.requestAirdrop(testAddress.publicKey,1000000000)
    

    const mainBalance = await connection.getBalance(provider.wallet.publicKey)
    console.log(mainBalance)
    

    // transfer from main wallet to new ones
    const transferTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: testAddress.publicKey,
        lamports: 1000000000,
      })
    );
    // how to setup signature for 
    await sendAndConfirmTransaction(connection, transferTransaction, []);

    const newBalance = await connection.getBalance(testAddress.publicKey)
    console.log(newBalance)

    await program.methods
      .initializeVault()
      .accounts({
        initializer: provider.wallet.publicKey,
        vault: vaultKeyPair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([vaultKeyPair])

      
    
      
    //let vaultAccount = await program.account.vault.fetch(provider.wallet.publicKey);

    //assert.ok(vaultAccount.owner.equals(provider.wallet.publicKey));
    //assert.ok(vaultAccount.amount.toNumber() === 0);



  })
  /*
  it('1 player transfer', async () => {

    const vaultKeyPair = provider.wallet
    const playerOne = anchor.web3.Keypair.generate()

    await program.methods
      .initializeVault()
      .accounts({
        initializer: vaultKeyPair.publicKey,
        vault: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([vaultKeyPair])

    await program.methods
      .transferVault({amount: 10})
      .accounts({
        payer: playerOne.publicKey,
        vault: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      
      
  
      
    let vaultAccount = await program.account.vault.fetch(vaultKeyPair.publicKey);

    assert.ok(vaultAccount.owner.equals(provider.wallet.publicKey));
    assert.ok(vaultAccount.amount.toNumber() === 10);



  })

  it('2 players transfer and winner', async () => {

    const vaultKeyPair = provider.wallet
    const playerOne = anchor.web3.Keypair.generate()
    const playerTwo = anchor.web3.Keypair.generate()

    await program.methods
      .initializeVault()
      .accounts({
        initializer: vaultKeyPair.publicKey,
        vault: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([vaultKeyPair])

    await program.methods
      .transferVault(10)
      .accounts({
        initializer: playerOne.publicKey,
        vault: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })

      
    await program.methods
      .transferVault(10)
      .accounts({
        initializer: playerTwo.publicKey,
        vault: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })

    
    await program.methods
      .transferWinner(10)
      .accounts({
        initializer: playerTwo.publicKey,
        vault: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })


    let vaultAccount = await program.account.vault.fetch(vaultKeyPair.publicKey);

    //assert.ok(vaultAccount.owner.equals(provider.wallet.publicKey));
    //assert.ok(vaultAccount.amount.toNumber() === 20);

  })
*/
});
