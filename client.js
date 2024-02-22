const { KMSClient } = require('@aws-sdk/client-kms');

// Configure the AWS region of your KMS key
const REGION = "eu-central-1"; // e.g., us-west-2

// Create and configure an instance of the KMS client
const kmsClient = new KMSClient({   region: REGION });

module.exports = { kmsClient };