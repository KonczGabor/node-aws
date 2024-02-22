const { DecryptCommand } = require('@aws-sdk/client-kms');
const { kmsClient } = require('./kms-client');

async function decryptData(encryptedData) {
    const decryptParams = {
        CiphertextBlob: encryptedData
    };

    try {
        const decryptCommand = new DecryptCommand(decryptParams);
        const { Plaintext } = await kmsClient.send(decryptCommand);
        return Plaintext.toString('base64');
    } catch (error) {
        console.error('Error decrypting data:', error);
        throw error;
    }
}

module.exports = { decryptData };