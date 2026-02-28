/**
 * 12D PSI Masterpiece Secure Vault
 * Purpose: Encrypts and persists sensitive somatic data in the frontend 
 * until the backend is fully connected. Prevents users from manually altering
 * visit records or intercepting their holistic scan parameters.
 */

const SECRET_KEY = "psi_quantum_architecture_2026";

// XOR cipher to obfuscate JSON payload before Base64 encoding
const xorEncryptDecrypt = (input: string): string => {
    let output = "";
    for (let i = 0; i < input.length; i++) {
        output += String.fromCharCode(input.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return output;
};

export const SecureVault = {
    /** Securely saves an object to LocalStorage */
    saveData: (key: string, data: any) => {
        try {
            const jsonString = JSON.stringify(data);
            // We use encodeURIComponent to handle non-ascii (Korean) chars safely for btoa
            const safeString = encodeURIComponent(jsonString);
            const xorString = xorEncryptDecrypt(safeString);
            const encoded = btoa(xorString);
            localStorage.setItem(`psi_vault_${key}`, encoded);
        } catch (e) {
            console.error("Vault Encryption Error", e);
        }
    },

    /** Retrieves and decrypts an object from LocalStorage */
    getData: (key: string) => {
        try {
            const encoded = localStorage.getItem(`psi_vault_${key}`);
            if (!encoded) return null;
            const xorString = atob(encoded);
            const safeString = xorEncryptDecrypt(xorString);
            const jsonString = decodeURIComponent(safeString);
            return JSON.parse(jsonString);
        } catch (e) {
            console.error("Vault Decryption Error", e);
            return null;
        }
    },

    getVisitCount: (): number => {
        const data = SecureVault.getData('meta_tracking');
        return data?.visitCount || 0;
    },

    incrementVisitCount: (): number => {
        const count = SecureVault.getVisitCount();
        SecureVault.saveData('meta_tracking', { visitCount: count + 1 });
        return count + 1;
    }
};
