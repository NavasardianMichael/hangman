import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { serverConfig } from './config'

// One SQLite file (Node's built-in node:sqlite) in DATA_DIR. One server process (systemd unit hangman), so a single
// synchronous connection is enough; WAL lets a backup read while the app writes.

export type TPaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

// Times are epoch milliseconds
export type TPaymentRow = {
  // The integer a gateway needs (Ameria's OrderID, plus an offset). AUTOINCREMENT never reuses one.
  order_number: number
  // Random; travels to the bank and back as `opaque`
  id: string
  // SHA-256 of the buyer's browser key; the key itself is never stored
  buyer_hash: string
  // Whole drams
  amount: number
  gateway: string
  gateway_payment_id: string | null
  status: TPaymentStatus
  failure_reason: string | null
  created_at: number
  paid_at: number | null
  // End of the month this payment bought
  premium_until: number | null
  // Last time the bank was asked whether a succeeded payment was refunded since
  checked_at: number | null
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS payments (
  order_number       INTEGER PRIMARY KEY AUTOINCREMENT,
  id                 TEXT    NOT NULL UNIQUE,
  buyer_hash         TEXT    NOT NULL,
  amount             INTEGER NOT NULL,
  gateway            TEXT    NOT NULL,
  gateway_payment_id TEXT    UNIQUE COLLATE NOCASE,
  status             TEXT    NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  failure_reason     TEXT,
  created_at         INTEGER NOT NULL,
  paid_at            INTEGER,
  premium_until      INTEGER,
  checked_at         INTEGER
);
CREATE INDEX IF NOT EXISTS payments_buyer ON payments (buyer_hash, status);
`

// Kept on globalThis: each route is its own bundle, and dev reloads modules
const holder = globalThis as typeof globalThis & { hangmanDb?: DatabaseSync }

export const getDb = (): DatabaseSync => {
  if (holder.hangmanDb) return holder.hangmanDb
  if (!serverConfig.dataDir) throw new Error('DATA_DIR is not set')
  mkdirSync(serverConfig.dataDir, { recursive: true })
  const db = new DatabaseSync(path.join(serverConfig.dataDir, 'hangman.db'))
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;')
  db.exec(SCHEMA)
  holder.hangmanDb = db
  return db
}
