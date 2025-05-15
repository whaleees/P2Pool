import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Contracts } from "../target/types/contracts";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("contracts", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Contracts as Program<Contracts>;

  let pool: Keypair;
  let collateralReserve: Keypair;
  let userTokenAccount: any;
  let poolTokenAccount: any;
  let poolSigner: PublicKey;

  let mintA: PublicKey;
  let mintB: PublicKey;
  let mintC: PublicKey;

  let userTokenA: any;
  let userTokenB: any;
  let userTokenC: any;

  let poolTokenA: any;
  let poolTokenB: any;
  let poolTokenC: any;

  before(async () => {
    pool = Keypair.generate();
    collateralReserve = Keypair.generate();

    mintA = await createMint(provider.connection, provider.wallet.payer, provider.wallet.publicKey, null, 6);
    mintB = await createMint(provider.connection, provider.wallet.payer, provider.wallet.publicKey, null, 6);
    mintC = await createMint(provider.connection, provider.wallet.payer, provider.wallet.publicKey, null, 6);

    userTokenA = await getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, mintA, provider.wallet.publicKey);
    userTokenB = await getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, mintB, provider.wallet.publicKey);
    userTokenC = await getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, mintC, provider.wallet.publicKey);

    const tx = await program.methods
      .initPoolReserve()
      .accounts({
        pool: pool.publicKey,
        collateralReserve: collateralReserve.publicKey,
        payer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([pool, collateralReserve])
      .rpc();

    console.log("Init tx: ", tx);

    poolSigner = PublicKey.findProgramAddressSync(
      [Buffer.from("pool_signer"), pool.publicKey.toBuffer()],
      program.programId
    )[0];

    poolTokenA = await getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, mintA, poolSigner, true);
    poolTokenB = await getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, mintB, poolSigner, true);
    poolTokenC = await getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.payer, mintC, poolSigner, true);

    await mintTo(provider.connection, provider.wallet.payer, mintA, userTokenA.address, provider.wallet.payer, 1_000_000);
    await mintTo(provider.connection, provider.wallet.payer, mintB, userTokenB.address, provider.wallet.payer, 1_000_000);
    await mintTo(provider.connection, provider.wallet.payer, mintC, userTokenC.address, provider.wallet.payer, 1_000_000);
  });

  it("should deposit tokenA to pool", async () => {
    const id = 1;
    const [yourDepositPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("deposit"),
        provider.wallet.publicKey.toBuffer(),
        new anchor.BN(id).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const tx = await program.methods
      .deposit(mintA, new anchor.BN(100_000), new anchor.BN(1))
      .accounts({
        pool: pool.publicKey,
        lender: provider.wallet.publicKey,
        poolDeposit: yourDepositPDA,
        lenderTokenAccount: userTokenA.address,
        poolTokenAccount: poolTokenA.address,
        tokenProgram: TOKEN_PROGRAM_ID,
        payer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([])
      .rpc();

    console.log("Deposit tx:", tx);
  });

  it("should borrow tokenB and using tokenC as collateral", async () => {
    const borrowId = 1;

    const [poolBorrowPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("borrow"),
        provider.wallet.publicKey.toBuffer(),
        new anchor.BN(borrowId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const tx = await program.methods
      .borrow(
        mintB,                     // borrow_token
        new anchor.BN(50_000),     // borrow_amount
        mintC,                     // collateral_token
        new anchor.BN(60_000),     // collateral_amount
        new anchor.BN(borrowId)
      )
      .accounts({
        pool: pool.publicKey,
        borrower: provider.wallet.publicKey,
        poolBorrow: poolBorrowPDA,
        collateralReserve: collateralReserve.publicKey,
        collateralPriceFeed: dummyPriceFeedC, // mock or placeholder for test
        borrowPriceFeed: dummyPriceFeedB,     // mock or placeholder for test
        borrowerTokenAccount: userTokenB.address,
        reserveTokenAccount: poolTokenC.address,
        poolTokenAccount: poolTokenB.address,
        tokenProgram: TOKEN_PROGRAM_ID,
        poolSigner: poolSigner,
        payer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([collateralReserve])
      .rpc();

    console.log("Borrow tx:", tx);
  });
});
