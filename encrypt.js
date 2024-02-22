const { EncryptCommand } = require('@aws-sdk/client-kms');
const { kmsClient } = require('./kms-client');

async function encryptData(keyId, plaintext) {
    try {
        const data = await kmsClient.send(new EncryptCommand({
            KeyId: keyId, // The ARN of your CMK
            Plaintext: Buffer.from(plaintext)
        }));
        return data.CiphertextBlob.toString('base64');
    } catch (error) {
        console.error("Encrypt error:", error);
        throw error;
    }
}

module.exports = { encryptData };