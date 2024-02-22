const { DecryptCommand } = require('@aws-sdk/client-kms');
const { kmsClient } = require('./kms-client');

async function decryptData(ciphertextBlob) {
    try {
        // Cipher text should be in a Uint8Array or a base64-encoded string
        const params = {
            CiphertextBlob: Buffer.from(ciphertextBlob, 'base64'), // Convert from base64 to binary
        };
        const command = new DecryptCommand(params);
        const response = await kmsClient.send(command);

        // Plaintext is a Uint8Array, convert it to a string
        const plaintext = new TextDecoder().decode(response.Plaintext);
        return plaintext;
    } catch (error) {
        console.error("Error decrypting data:", error);
        throw error;
    }
}

module.exports = { decryptData };