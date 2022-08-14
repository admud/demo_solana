import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
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
import { BN } from "bn.js";
const assert = require("assert");


describe("test", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider)
  //anchor.setProvider(anchor.AnchorProvider.env());
  //const connection = anchor.getProvider().connection;
  //const connection = new Connection("https://api.mainnet-beta.solana.com");
  const connection = new Connection('https://rpc.ankr.com/solana_devnet',"confirmed")
  //const connection =new Connection('https://solana-devnet-rpc.allthatnode.com')
  //const connection = new Connection('https://api.devnet.solana.com', "confirmed")
  const program = anchor.workspace.Test as Program<Test>;

  //const vaultKeyPair = anchor.web3.Keypair.generate()
  //const signer = anchor.web3.Keypair.fromSecretKey()
  it('init vault', async () => {
    
    const testAddress = anchor.web3.Keypair.generate()
    const player1Address = anchor.web3.Keypair.generate()
    const player2Address = anchor.web3.Keypair.generate()

    
    const player1balance = (await connection.getBalance(player1Address.publicKey))
    console.log('START')
    console.log(`player1 balance :  ${player1balance}`);

    const player2balance = (await connection.getBalance(player2Address.publicKey))
    console.log(`player2 balance : ${player2balance}`)

    
    // airdrop 1 SOL
    // localnet airdrop not working

    /*
    const tx_test = await program.methods.transferSol(new anchor.BN(0.1*1e9)).accounts
    ({
      from: provider.wallet.publicKey,
      to: player1Address.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([])
    .rpc()
    
    await connection.confirmTransaction(tx_test)

    const tempbalance = await connection.getBalance(player1Address.publicKey)
    console.log(`player 1 balance : ${tempbalance}`)

    */

    const signaturetest = await connection.requestAirdrop(testAddress.publicKey,LAMPORTS_PER_SOL *1)
    await connection.confirmTransaction(signaturetest)

    const signature1 = await connection.requestAirdrop(player1Address.publicKey,LAMPORTS_PER_SOL *1)
    await connection.confirmTransaction(signature1)
    console.log('AIRDROPPING TO player1 WALLET')
    const newBalance1 = (await connection.getBalance(player1Address.publicKey))
    console.log(`new player1 balance :  ${newBalance1}`);

    const signature2 = await connection.requestAirdrop(player2Address.publicKey, LAMPORTS_PER_SOL * 1)
    await connection.confirmTransaction(signature2)
    console.log(`AIRDROPPING TO player2 wallet`)
    const newBalance2 = (await connection.getBalance(player2Address.publicKey))
    console.log(`new player2 balance : ${newBalance2}`)

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
      [Buffer.from(anchor.utils.bytes.utf8.encode('vault')), testAddress.publicKey.toBuffer()
    ],program.programId
    );

  /*
    await program.rpc.initializeVault({
      accounts: {
        initializer: testAddress.publicKey,
        vault: vaultPDA,
        systemProgram : anchor.web3.SystemProgram.programId,
      },
      signers:[],
    });
       */ 


    await program.methods
      .initializeVault()
      .accounts({
        // initializer: testAddress.publicKey,
        initializer: testAddress.publicKey,
        vault: vaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      // does the provider wallet sign this by defaullt?
      .signers([testAddress])
      .rpc()
    

    console.log('-------------------------------'); 
    console.log('transferring from player1 wallet to vault');
    
    /*
    await program.rpc.transferVault(new anchor.BN(1),{
      accounts: {
        payer: testAddress.publicKey,
        vault: vaultKeyPair.publicKey,
        systemProgram : anchor.web3.SystemProgram.programId,
      },
    });
    */

    
    const tx_player1 = await program.methods.transferVault(new anchor.BN(0.1*1e9)).accounts
    ({
      payer: player1Address.publicKey,
      vault: vaultPDA,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([player1Address])
    .rpc()
    
    await connection.confirmTransaction(tx_player1)

    const tx_player2 = await program.methods.transferVault(new anchor.BN(0.1*1e9))
    .accounts
    ({
      payer: player2Address.publicKey,
      vault: vaultPDA,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([player2Address])
    .rpc()

    await connection.confirmTransaction(tx_player2)

    console.log('-------------------------------'); 
    console.log('transferring from player2 wallet to vault');
    

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

    

    const vaultBalance = (await connection.getBalance(vaultPDA)) 

    console.log(`vault balance :  ${vaultBalance}`);
    //let vaultAccount = await program.account.vault.fetch(provider.wallet.publicKey);

    //assert.ok(vaultAccount.owner.equals(provider.wallet.publicKey));
    //assert.ok(vaultAccount.amount.toNumber() === 0);

    // vault transfer to winner

    const winnerAddress= anchor.web3.Keypair.generate()


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
