/**
 * Biometrics Helper Library
 * Uses WebAuthn API for biometric authentication (TouchID, FaceID, Windows Hello, etc.)
 */

/**
 * Checks if the device supports biometric authentication (platform authenticators)
 */
export const isBiometricsAvailable = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
        return false;
    }

    try {
        // Check if platform authenticator is available
        const result = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return result;
    } catch (error) {
        console.error("Biometric availability check failed:", error);
        return false;
    }
};

/**
 * Creates a new credential for the user
 * In a real app with a backend, we'd fetch the challenge from the server.
 * For this client-side privacy lock, we'll generate a local challenge.
 */
export const registerBiometrics = async (userId: string, username: string): Promise<boolean> => {
    if (!await isBiometricsAvailable()) {
        throw new Error("Biometrics not available on this device");
    }

    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
            challenge,
            rp: {
                name: "ERP Vault",
                id: window.location.hostname,
            },
            user: {
                id: Uint8Array.from(userId, c => c.charCodeAt(0)),
                name: username,
                displayName: username,
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "required",
            },
            timeout: 60000,
            attestation: "none"
        };

        const credential = await navigator.credentials.create({
            publicKey: publicKeyCredentialCreationOptions
        });

        return !!credential;
    } catch (error) {
        console.error("Biometric registration failed:", error);
        throw error;
    }
};

/**
 * Verifies the user using biometrics
 */
export const verifyBiometrics = async (): Promise<boolean> => {
    if (!await isBiometricsAvailable()) {
        throw new Error("Biometrics not available");
    }

    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
            challenge,
            timeout: 60000,
            userVerification: "required",
            // We verify against any registered credential on this domain
        };

        const assertion = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions
        });

        return !!assertion;
    } catch (error) {
        // User cancelled or failed verification
        console.error("Biometric verification failed:", error);
        return false;
    }
};
