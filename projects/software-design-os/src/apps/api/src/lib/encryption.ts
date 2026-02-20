import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // NIST recommended for AES-GCM

/** Derive a 256-bit key from the ENCRYPTION_KEY env var using SHA-256. */
let _cachedKey: Buffer | null = null

function getEncryptionKey(): Buffer {
  if (_cachedKey) return _cachedKey
  const secret = process.env.ENCRYPTION_KEY
  if (!secret) {
    throw new Error('ENCRYPTION_KEY environment variable is required')
  }
  if (secret.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters')
  }
  _cachedKey = createHash('sha256').update(secret).digest()
  return _cachedKey
}

/** Encrypt plaintext. Returns base64 string: iv:authTag:ciphertext */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`
}

/** Decrypt a string produced by encrypt(). */
export function decrypt(encryptedString: string): string {
  const key = getEncryptionKey()
  const parts = encryptedString.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted string format')
  }
  const iv = Buffer.from(parts[0], 'base64')
  const authTag = Buffer.from(parts[1], 'base64')
  const ciphertext = Buffer.from(parts[2], 'base64')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}
