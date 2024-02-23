const { KMSClient, EncryptCommand, DecryptCommand } = require("@aws-sdk/client-kms");

// Create KMS client
const client = new KMSClient({ region: "eu-central-1" });

// Encrypt function
async function encryptText(text, keyId, encryptionContext) {
    const encryptParams = {
        KeyId: keyId,
        Plaintext: Buffer.from(text),
        EncryptionContext: encryptionContext
    };

    const encryptCommand = new EncryptCommand(encryptParams);
    const { CiphertextBlob } = await client.send(encryptCommand);

    return CiphertextBlob.toString("base64");
}

// Decrypt function
async function decryptText(encryptedText, encryptionContext) {
    const decryptParams = {
        CiphertextBlob: Buffer.from(encryptedText, "base64"),
        EncryptionContext: encryptionContext
    };

    const decryptCommand = new DecryptCommand(decryptParams);
    const { Plaintext } = await client.send(decryptCommand);

    return Plaintext.toString();
}

// Usage example
const keyId = "arn:aws:kms:eu-central-1:693208135292:key/17cb2ff1-ea1c-45f4-8204-56fd25ec4983";
const encryptionContext = { Purpose: "Example" };
const textToEncrypt = "Sensitive data";

encryptText(textToEncrypt, keyId, encryptionContext)
    .then(encryptedText => {
        console.log("Encrypted text:", encryptedText);
        return decryptText(encryptedText, encryptionContext);
    })
    .then(decryptedText => {
        console.log("Decrypted text:", decryptedText);
    })
    .catch(err => {
        console.error("Error:", err);
    });