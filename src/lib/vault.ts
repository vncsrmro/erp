import CryptoJS from "crypto-js";

/**
 * Vault Module - AES-256 Encryption for sensitive data
 * Used to securely store credentials, API keys, and passwords
 */

// Get the encryption key from environment variables
const getEncryptionKey = (): string => {
    const key = process.env.VAULT_ENCRYPTION_KEY || process.env.NEXT_PUBLIC_VAULT_KEY;
    if (!key) {
        throw new Error("VAULT_ENCRYPTION_KEY is not defined in environment variables");
    }
    return key;
};

/**
 * Encrypt a plain text string using AES-256
 * @param plainText - The text to encrypt
 * @returns Encrypted string (base64 encoded)
 */
export const encrypt = (plainText: string): string => {
    try {
        const key = getEncryptionKey();
        const encrypted = CryptoJS.AES.encrypt(plainText, key).toString();
        return encrypted;
    } catch (error) {
        console.error("Encryption error:", error);
        throw new Error("Failed to encrypt data");
    }
};

/**
 * Decrypt an encrypted string using AES-256
 * @param encryptedText - The encrypted string (base64 encoded)
 * @returns Decrypted plain text
 */
export const decrypt = (encryptedText: string): string => {
    try {
        const key = getEncryptionKey();
        const bytes = CryptoJS.AES.decrypt(encryptedText, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) {
            throw new Error("Decryption failed - invalid key or corrupted data");
        }
        return decrypted;
    } catch (error) {
        console.error("Decryption error:", error);
        throw new Error("Failed to decrypt data");
    }
};

/**
 * Hash a password using SHA256 (for comparison purposes)
 * @param password - The password to hash
 * @returns Hashed password
 */
export const hashPassword = (password: string): string => {
    return CryptoJS.SHA256(password).toString();
};

/**
 * Generate a random secure key
 * @param length - Length of the key (default: 32)
 * @returns Random key string
 */
export const generateKey = (length: number = 32): string => {
    return CryptoJS.lib.WordArray.random(length).toString();
};

/**
 * Vault data structure for storing credentials
 */
export interface VaultCredential {
    id: string;
    clientId: string;
    type: "api_key" | "password" | "ssh_key" | "token" | "other";
    name: string;
    encryptedValue: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Create a vault credential entry
 */
export const createVaultEntry = (
    clientId: string,
    type: VaultCredential["type"],
    name: string,
    value: string,
    notes?: string
): Omit<VaultCredential, "id"> => {
    return {
        clientId,
        type,
        name,
        encryptedValue: encrypt(value),
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
};

/**
 * Decrypt a vault credential entry
 */
export const decryptVaultEntry = (credential: VaultCredential): string => {
    return decrypt(credential.encryptedValue);
};
