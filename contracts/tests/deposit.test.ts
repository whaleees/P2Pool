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

  it("should perform deposit successfully", async () => {
    const id = 0;
    const idBN = new anchor.BN(id);

    // 1. Generate token mint
    mint = await createMint(
      provider.connection,
      provider.wallet as any,
      payer.publicKey,
      null,
      6
    );

    // 2. Create lender's token account
    lenderTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet as any,
      mint,
      lender.publicKey
    );

    // 3. Mint token to lender
    await mintTo(
      provider.connection,
      provider.wallet as any,
      mint,
      lenderTokenAccount.address,
      payer.publicKey,
      1_000_000_000
    );

    // 4. Init pool
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

    // 5. Derive pool signer PDA
    [poolSigner] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("pool_signer"), pool.publicKey.toBuffer()],
      program.programId
    );

    // 6. Create pool token account owned by pool signer
    poolTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet as any,
      mint,
      poolSigner,
      true
    );

    // 7. Derive pool deposit PDA (corrected to use 8-byte LE)
    [poolDeposit] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("deposit"), lender.publicKey.toBuffer(), Buffer.from(idBN.toArray("le", 8))],
      program.programId
    );

    // 8. Call deposit
    await program.methods
      .deposit(mint, new anchor.BN(500_000_000), idBN)
      .accounts({
        pool: pool.publicKey,
        lender: lender.publicKey,
        poolDeposit: poolDeposit,
        lenderTokenAccount: lenderTokenAccount.address,
        poolTokenAccount: poolTokenAccount.address,
        payer: payer.publicKey,
        poolSigner: poolSigner,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // 9. Fetch state and validate
    const depositAccount = await program.account.poolDeposit.fetch(poolDeposit);

    assert.equal(depositAccount.lenderWallet.toBase58(), lender.publicKey.toBase58());
    assert.equal(depositAccount.depositMint.toBase58(), mint.toBase58());
    assert.ok(depositAccount.depositAmount.eq(new anchor.BN(500_000_000)));
  });
});
