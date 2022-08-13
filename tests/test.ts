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
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
const assert = require("assert");

describe("test", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider)
  //anchor.setProvider(anchor.AnchorProvider.env());
  //const connection = anchor.getProvider().connection;
  //const connection = new Connection("https://api.mainnet-beta.solana.com");
  //const connection = new Connection('https://api.devnet.solana.com')
  const connection = new Connection('https://api.devnet.solana.com', "confirmed")
  const program = anchor.workspace.Test as Program<Test>;

  //const signer = anchor.web3.Keypair.fromSecretKey()
  it('init vault', async () => {
    const vaultKeyPair = anchor.web3.Keypair.generate()
    const testAddress = anchor.web3.Keypair.generate()
    
    const balance = (await connection.getBalance(testAddress.publicKey))
    console.log('START')
    console.log(`test balance :  ${balance}`);
    
    // airdrop 1 SOL
    // localnet airdrop not working
    const signature = await connection.requestAirdrop(testAddress.publicKey,LAMPORTS_PER_SOL *2)
    await connection.confirmTransaction(signature)
    console.log('AIRDROPPING TO TEST WALLET')
    const newBalance = (await connection.getBalance(testAddress.publicKey))
    console.log(`new test balance :  ${newBalance}`);


    const mainBalance = (await connection.getBalance(provider.wallet.publicKey))
    console.log(`new main wallet balance :  ${mainBalance}`);
    

    // transfer from main wallet to new ones
    /*
    const transferTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: testAddress.publicKey,
        lamports: 1000000000,
      })
    );
    
    await sendAndConfirmTransaction(connection, transferTransaction, [provider.wallet]);
    */
    
    const [vaultPDA] = await anchor.web3.PublicKey.findProgramAddress(
      [utf8.encode('vault')
    ],program.programId
    );

  /*
    await program.rpc.initializeVault({
      accounts: {
        initializer: provider.wallet.publicKey,
        vault: vaultPDA,
        systemProgram : anchor.web3.SystemProgram.programId,
      },
      signers:[],
    });
       */ 
    console.log(provider.wallet.publicKey.toString())
    console.log(SystemProgram.programId.toString())
    
    await program.methods
      .initializeVault()
      .accounts({
        initializer: provider.wallet.publicKey,
        vault: vaultKeyPair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      // does the provider wallet sign this by defaullt?
      .signers([])
      .rpc()
    

    console.log('-------------------------------'); 
    console.log('transferring from main wallet to vault');
    
    /*
    await program.rpc.transferVault(new anchor.BN(1),{
      accounts: {
        payer: testAddress.publicKey,
        vault: vaultKeyPair.publicKey,
        systemProgram : anchor.web3.SystemProgram.programId,
      },
    });
    */

    
    await program.methods.transferVault(new anchor.BN(1)).accounts
    ({
      payer: provider.wallet.publicKey,
      vault: vaultKeyPair.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([])
    .rpc()
    
    
    /*
    await program.methods.transferNativeSol(new anchor.BN(1)).accounts
    ({
      from: testAddress.publicKey,
      to: vaultKeyPair.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
    */
    const vaultBalance = (await connection.getBalance(vaultKeyPair.publicKey)) 
    console.log(`vault balance :  ${vaultBalance}`);
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
