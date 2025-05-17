import * as anchor from "@coral-xyz/anchor";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";
import { Program } from "@coral-xyz/anchor";
import { Contracts } from "../target/types/contracts";

describe("deposit_handler", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Contracts as Program<Contracts>;

  const payer = provider.wallet;
  const lender = provider.wallet;

  let mint: anchor.web3.PublicKey;
  let lenderTokenAccount: any;
  let poolSigner: anchor.web3.PublicKey;
  let poolTokenAccount: any;
  let poolDeposit: anchor.web3.PublicKey;
  let pool = anchor.web3.Keypair.generate();
  let collateralReserve = anchor.web3.Keypair.generate();

  it("should initialize the pool and collateral reserve", async () => {
    const pool = anchor.web3.Keypair.generate();
    const collateralReserve = anchor.web3.Keypair.generate();

    await program.methods
      .initPoolReserve()
      .accounts({
        pool: pool.publicKey,
        collateralReserve: collateralReserve.publicKey,
        payer: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([pool, collateralReserve])
      .rpc();

    const poolAccount = await program.account.pool.fetch(pool.publicKey);
    const reserveAccount = await program.account.collateralReserve.fetch(collateralReserve.publicKey);

    assert.ok(poolAccount);
    assert.ok(reserveAccount);
  });

  it("should deposit tokens into the pool", async () => {
    const id = new anchor.BN(0);
    const mint = await createMint(provider.connection, payer as any, payer.publicKey, null, 6);
    const lenderTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, payer as any, mint, payer.publicKey);
    await mintTo(provider.connection, payer as any, mint, lenderTokenAccount.address, payer.publicKey, 1_000_000_000);

    const pool = anchor.web3.Keypair.generate();
    const collateralReserve = anchor.web3.Keypair.generate();
    await program.methods.initPoolReserve().accounts({
      pool: pool.publicKey,
      collateralReserve: collateralReserve.publicKey,
      payer: payer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([pool, collateralReserve]).rpc();

    const [poolSigner] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from("pool_signer"), pool.publicKey.toBuffer()], program.programId);
    const poolTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, payer as any, mint, poolSigner, true);

    const [poolDeposit] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("deposit"), payer.publicKey.toBuffer(), Buffer.from(id.toArray("le", 8))],
      program.programId
    );

    await program.methods.deposit(mint, new anchor.BN(500_000_000), id).accounts({
      pool: pool.publicKey,
      lender: payer.publicKey,
      poolDeposit,
      lenderTokenAccount: lenderTokenAccount.address,
      poolTokenAccount: poolTokenAccount.address,
      payer: payer.publicKey,
      poolSigner,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    const depositAccount = await program.account.poolDeposit.fetch(poolDeposit);
    assert.equal(depositAccount.depositAmount.toString(), "500000000");
  });

  it("should borrow tokens using collateral", async () => {
    const borrowAmount = new anchor.BN(200_000_000);
    const collateralAmount = new anchor.BN(240_000_000); // 120% of borrow
    const id = new anchor.BN(1);

    const mint = await createMint(provider.connection, payer as any, payer.publicKey, null, 6);
    const borrowerTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, payer as any, mint, payer.publicKey);
    const reserveTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, payer as any, mint, payer.publicKey);

    await mintTo(provider.connection, payer as any, mint, reserveTokenAccount.address, payer.publicKey, 500_000_000);

    const [poolSigner] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from("pool_signer"), pool.publicKey.toBuffer()], program.programId);
    const [poolBorrow] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("borrow"), payer.publicKey.toBuffer(), Buffer.from(id.toArray("le", 8))],
      program.programId
    );

    const collateralReserve = await program.account.collateralReserve.fetch(collateralReservePubkey);

    // Use mocked oracle account addresses
    const collateralPrice = await createMockOracleAccount(program, 1_200_000); // 1.2 USD
    const borrowPrice = await createMockOracleAccount(program, 1_000_000);     // 1.0 USD

    await program.methods.borrow(
      mint, borrowAmount, mint, collateralAmount, id, "btc", "btc", { oneDay: {} }
    ).accounts({
      pool: pool.publicKey,
      borrower: payer.publicKey,
      poolBorrow,
      collateralReserve: collateralReservePubkey,
      reserveTokenAccount: reserveTokenAccount.address,
      borrowerTokenAccount: borrowerTokenAccount.address,
      poolTokenAccount: poolTokenAccount.address,
      poolSigner,
      payer: payer.publicKey,
      borrowPriceFeed: borrowPrice,
      collateralPriceFeed: collateralPrice,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    const borrowState = await program.account.poolBorrow.fetch(poolBorrow);
    assert.ok(borrowState.borrowAmount.eq(borrowAmount));
  });

  it("should repay borrowed tokens", async () => {
    await program.methods.repay(mint, borrowAmount, mint, id).accounts({
      pool: pool.publicKey,
      borrower: payer.publicKey,
      poolBorrow,
      collateralReserve: collateralReservePubkey,
      reserveTokenAccount: reserveTokenAccount.address,
      borrowerTokenAccount: borrowerTokenAccount.address,
      poolTokenAccount: poolTokenAccount.address,
      poolSigner,
      payer: payer.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    const borrowState = await program.account.poolBorrow.fetch(poolBorrow);
    assert.equal(borrowState.borrowAmount.toString(), "0");
  });

  it("should liquidate an undercollateralized position", async () => {
    const lowerCollateralPrice = await createMockOracleAccount(program, 800_000); // price dropped

    await program.methods.liquidate(id, "btc", "btc").accounts({
      pool: pool.publicKey,
      liquidator: payer.publicKey,
      poolBorrow,
      reserveTokenAccount: reserveTokenAccount.address,
      liquidatorTokenAccount: liquidatorTokenAccount.address,
      poolSigner,
      collateralReserve: collateralReservePubkey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    const borrowState = await program.account.poolBorrow.fetch(poolBorrow);
    assert.equal(borrowState.borrowAmount.toString(), "0");
  });

  it("should create and accept a P2P loan offer", async () => {
    const p2pId = new anchor.BN(0);
    const [p2p] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("p2p"), lender.publicKey.toBuffer(), Buffer.from(p2pId.toArray("le", 8))],
      program.programId
    );

    await program.methods.offerP2p(
      p2pId,
      mint, new anchor.BN(300_000_000),
      mint, new anchor.BN(360_000_000),
      new anchor.BN(5_00), // 5%
      { threeDays: {} }
    ).accounts({
      p2p,
      lender: lender.publicKey,
      lenderTokenAccount: lenderTokenAccount.address,
      poolSigner,
      pool: pool.publicKey,
      poolTokenAccount: poolTokenAccount.address,
      payer: lender.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    await program.methods.acceptP2p(p2pId).accounts({
      p2p,
      borrower: payer.publicKey,
      collateralReserve: collateralReservePubkey,
      poolTokenAccount: poolTokenAccount.address,
      borrowerTokenAccount: borrowerTokenAccount.address,
      borrowerCollateralAccount: borrowerCollateralAccount.address,
      reserveTokenAccount: reserveTokenAccount.address,
      poolSigner,
      pool: pool.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc();

    const p2pState = await program.account.p2P.fetch(p2p);
    assert.ok(p2pState.isActive === false);
    assert.ok(p2pState.borrowerWallet.equals(payer.publicKey));
  });

  async function createMockOracleAccount(program, price: number) {
    const mock = anchor.web3.Keypair.generate();
    await program.methods.initMockOracle(new anchor.BN(price), new anchor.BN(6)).accounts({
      oracleMock: mock.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([mock]).rpc();
    return mock.publicKey;
  }


});
