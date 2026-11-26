import {
  ShieldedCoinPublicKey,
  ShieldedEncryptionPublicKey,
  UnshieldedAddress,
  MidnightBech32m,
} from '@midnightntwrk/wallet-sdk-address-format';

/** Generates a fresh 32-byte identifier for on-chain circuit calls. */
export function randomBytes32(): Uint8Array {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Converts a 0x-prefixed hex value into bytes; used for existing pool and loan IDs. */
export function hexToBytes(value: string): Uint8Array {
  const clean = value.replace(/^0x/, '');
  if (clean.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(clean)) {
    throw new Error('Invalid hex identifier.');
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** Decodes a wallet's shielded public key from Bech32m or 32-byte hex. */
export function decodeShieldedKey(
  value: string,
  kind: 'coin' | 'encryption',
  networkId: string
): string {
  if (/^[0-9a-fA-F]{64}$/.test(value)) return value.toLowerCase();
  try {
    const parsed = MidnightBech32m.parse(value);
    return kind === 'coin'
      ? ShieldedCoinPublicKey.codec.decode(networkId, parsed).toHexString()
      : ShieldedEncryptionPublicKey.codec.decode(networkId, parsed).toHexString();
  } catch {
    throw new Error(`Wallet returned an invalid ${kind} public key; expected hex or Bech32m.`);
  }
}

/** Converts a wallet's unshielded Bech32m address (or raw hex) to a 32-byte contract identifier. */
export function addressToBytes32(value: string, networkId: string): Uint8Array {
  const clean = value.replace(/^0x/, '');
  if (/^[0-9a-fA-F]{64}$/.test(clean)) return hexToBytes(clean);
  try {
    const parsed = MidnightBech32m.parse(value);
    const address = UnshieldedAddress.codec.decode(networkId, parsed);
    const bytes = new Uint8Array(address.data);
    if (bytes.length !== 32) {
      throw new Error(`Decoded address is ${bytes.length} bytes; expected 32.`);
    }
    return bytes;
  } catch {
    throw new Error('Wallet returned an invalid unshielded address; expected Bech32m or 32-byte hex.');
  }
}
