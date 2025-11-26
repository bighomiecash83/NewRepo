export async function encryptField(text:string){ return { ciphertext: text }; }
export async function decryptField(bundle:any){ return bundle.ciphertext; }
