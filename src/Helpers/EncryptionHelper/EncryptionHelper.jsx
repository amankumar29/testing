// const secretKey = process.env.REACT_APP_SECRET_CODE;
// const key = process.env.REACT_APP_SECRET_CODE;
const key = "Ideya022022Labss"; // Example IV, ensure this is the same on both ends

export const EncryptionHelper = async (plainText) => {
  const encoder = new TextEncoder();
  const keyBuffer = encoder.encode(key);
  const plainTextBuffer = encoder.encode(plainText);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-CBC" },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(16));

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    cryptoKey,
    plainTextBuffer
  );

  const ivAndEncryptedBuffer = new Uint8Array(
    iv.length + encryptedBuffer.byteLength
  );
  ivAndEncryptedBuffer.set(iv);
  ivAndEncryptedBuffer.set(new Uint8Array(encryptedBuffer), iv.length);

  return btoa(String.fromCharCode(...ivAndEncryptedBuffer));
};
