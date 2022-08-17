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
  //const connection = new Connection('https://rpc.ankr.com/solana_devnet',"confirmed")
  //const connection =new Connection('https://solana-devnet-rpc.allthatnode.com')
  const connection = new Connection('https://api.devnet.solana.com', "confirmed")
  const program = anchor.workspace.Test as Program<Test>;

  const vaultKeyPair = anchor.web3.Keypair.generate()
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

    // if new wallets need airdrops
    /*
    const signaturetest = await connection.requestAirdrop(testAddress.publicKey,LAMPORTS_PER_SOL *1)
    await connection.confirmTransaction(signaturetest)
    
    const signature1 = await connection.requestAirdrop(player1Address.publicKey,LAMPORTS_PER_SOL *1)
    await connection.confirmTransaction(signature1)
    console.log('AIRDROPPING TO player1 WALLET')
    const newBalance1 = (await connection.getBalance(player1Address.publicKey))
    console.log(`new player1 balance :  ${newBalance1}`);
    */
    
    // get program id
    const [vaultPDA] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode('vault')), provider.wallet.publicKey.toBuffer()
    ],program.programId
    );

        
    // init vault
    await program.methods.initializeVault().accounts
    ({
      initializer: provider.wallet.publicKey,
      vault:vaultPDA,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([])
    .rpc()
    
    // fill 2 test wallets with sol from main wallet
    const temp1 = await program.methods.transferSol(new anchor.BN(0.1*1e9)).accounts
    ({
      from: provider.wallet.publicKey,
      to: player1Address.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([])
    .rpc()
    
    await connection.confirmTransaction(temp1)
    const newBalance1 = (await connection.getBalance(player1Address.publicKey))
    console.log(`new player1 balance :  ${newBalance1}`);


    const temp2 = await program.methods.transferSol(new anchor.BN(0.2*1e9)).accounts
    ({
      from: provider.wallet.publicKey,
      to: player2Address.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([])
    .rpc()
    
    await connection.confirmTransaction(temp2)
    const newBalance2 = (await connection.getBalance(player2Address.publicKey))
    console.log(`new player1 balance :  ${newBalance2}`);
    console.log('-------------------------------'); 
    console.log('transferring from player1 wallet to vault');

    // both player wallets transfer to vault
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

    const vaultBalance = (await connection.getBalance(vaultPDA)) 

    console.log(`vault balance :  ${vaultBalance}`);

    // vault transfer to winner    
    const winner_before = (await connection.getBalance(player1Address.publicKey)) 

    console.log(`winner balance before :  ${winner_before}`);

    // transfer all lamports from vault to winner
    const winner = await program.methods.transferWinner(new anchor.BN(0.3*1e9)).accounts
    ({
      payer: provider.wallet.publicKey,
      vault: vaultPDA,
      winner: player1Address.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([])
    .rpc()
    
    await connection.confirmTransaction(winner)
    const winner_after = (await connection.getBalance(player1Address.publicKey)) 

    console.log(`winner balance after:  ${winner_after}`);


  })
 
});
