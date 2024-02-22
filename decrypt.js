const { DecryptCommand } = require('@aws-sdk/client-kms');
const { kmsClient } = require('./kms-client');

async function decryptData(ciphertext) {
    try {
        const data = await kmsClient.send(new DecryptCommand({
            CiphertextBlob: Buffer.from(ciphertext, 'base64')
        }));
        return data.Plaintext.toString();
    } catch (error) {
        console.error("Decrypt error:", error);
        throw error;
    }
}

module.exports = { decryptData };