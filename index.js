// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const FROM_SECRET_KEY = new Uint8Array(
    [
        253, 57, 43, 95, 95, 73, 82, 129, 159, 155, 195,
        36, 165, 249, 243, 214, 193, 115, 140, 72, 212, 195,
        155, 65, 39, 99, 143, 204, 240, 59, 167, 40, 45,
        188, 74, 51, 67, 53, 99, 79, 208, 202, 212, 137,
        228, 168, 150, 180, 152, 103, 34, 220, 196, 63, 41,
        168, 212, 66, 176, 81, 154, 101, 1, 87
    ]
);

const generateKeyPair = async () => {
    const from = Keypair.generate();
    console.log(from);
}

const transferSol = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(FROM_SECRET_KEY);

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    let fromBalance = await connection.getBalance(from.publicKey);
    let lamportFromBalance = fromBalance / LAMPORTS_PER_SOL;
    console.log('from wallet balance: ', lamportFromBalance);

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    fromBalance = await connection.getBalance(from.publicKey);
    lamportFromBalance = fromBalance / LAMPORTS_PER_SOL;
    console.log('from wallet balance: ', lamportFromBalance);

    // Get 50% of the sender balance to transfer
    const tokenToTransfer = lamportFromBalance / 2;
    console.log('token to transfer: ', tokenToTransfer);

    let toBalance = await connection.getBalance(to.publicKey);
    let lamportToBalance = toBalance / LAMPORTS_PER_SOL;
    console.log('to wallet Balance: ', lamportToBalance);

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: parseFloat(tokenToTransfer) * LAMPORTS_PER_SOL
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );

    toBalance = await connection.getBalance(to.publicKey);
    lamportToBalance = toBalance / LAMPORTS_PER_SOL;
    console.log("to wallet balance: ", lamportToBalance);
    console.log('Signature is ', signature);
}

transferSol();
