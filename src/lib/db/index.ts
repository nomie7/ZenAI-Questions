import Database from "better-sqlite3";
import path from "path";
import { mkdirSync, existsSync } from "fs";

// Database file location - Docker-friendly: use data directory or env var
// Defaults to ./data/feedback.db (can be mounted as volume in Docker)
const DATA_DIR = process.env.DB_DATA_DIR || path.join(process.cwd(), "data");
const DB_FILENAME = process.env.DB_FILENAME || "feedback.db";
const DB_PATH = path.join(DATA_DIR, DB_FILENAME);

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Create database connection (singleton pattern)
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL"); // Better performance for concurrent access
    initializeSchema();
  }
  return db;
}

/**
 * Initialize database schema
 */
function initializeSchema() {
  const database = db!;

  // Create conversations table to track chat sessions
  database.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      total_messages INTEGER DEFAULT 0
    )
  `);

  // Create messages table to store all messages
  database.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    )
  `);

  // Create feedback table for thumbs up/down
  // Note: Foreign keys removed since we're not populating messages/conversations tables
  // Drop and recreate to remove foreign key constraints if they exist
  database.exec("DROP TABLE IF EXISTS feedback");
  database.exec(`
    CREATE TABLE feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL,
      conversation_id TEXT,
      user_message TEXT,
      assistant_response TEXT,
      feedback_type TEXT NOT NULL CHECK(feedback_type IN ('thumbs_up', 'thumbs_down')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT
    )
  `);

  // Create index for faster queries
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_feedback_message_id ON feedback(message_id);
    CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
  `);

  console.log("[DB] Database schema initialized");
}

/**
 * Feedback types
 */
export type FeedbackType = "thumbs_up" | "thumbs_down";

export interface FeedbackRecord {
  id?: number;
  message_id: string;
  conversation_id?: string;
  user_message?: string;
  assistant_response: string;
  feedback_type: FeedbackType;
  created_at?: string;
  metadata?: Record<string, unknown>;
}

export interface MessageRecord {
  id: string;
  conversation_id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

/**
 * Save feedback to database
 */
export function saveFeedback(feedback: FeedbackRecord): number {
  const database = getDatabase();

  const stmt = database.prepare(`
    INSERT INTO feedback (message_id, conversation_id, user_message, assistant_response, feedback_type, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    feedback.message_id,
    feedback.conversation_id || null,
    feedback.user_message || null,
    feedback.assistant_response,
    feedback.feedback_type,
    feedback.metadata ? JSON.stringify(feedback.metadata) : null
  );

  return result.lastInsertRowid as number;
}

/**
 * Get feedback by message ID
 */
export function getFeedbackByMessageId(messageId: string): FeedbackRecord | null {
  const database = getDatabase();

  const stmt = database.prepare(`
    SELECT * FROM feedback WHERE message_id = ?
  `);

  const row = stmt.get(messageId) as FeedbackRecord | undefined;

  if (row && row.metadata) {
    row.metadata = JSON.parse(row.metadata as unknown as string);
  }

  return row || null;
}

/**
 * Get all feedback records
 */
export function getAllFeedback(limit = 100, offset = 0): FeedbackRecord[] {
  const database = getDatabase();

  const stmt = database.prepare(`
    SELECT * FROM feedback
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);

  const rows = stmt.all(limit, offset) as FeedbackRecord[];

  return rows.map((row) => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata as unknown as string) : undefined,
  }));
}

/**
 * Get feedback statistics
 */
export function getFeedbackStats(): {
  total: number;
  thumbs_up: number;
  thumbs_down: number;
  satisfaction_rate: number;
} {
  const database = getDatabase();

  const total = database
    .prepare("SELECT COUNT(*) as count FROM feedback")
    .get() as { count: number };

  const thumbsUp = database
    .prepare("SELECT COUNT(*) as count FROM feedback WHERE feedback_type = 'thumbs_up'")
    .get() as { count: number };

  const thumbsDown = database
    .prepare("SELECT COUNT(*) as count FROM feedback WHERE feedback_type = 'thumbs_down'")
    .get() as { count: number };

  const satisfactionRate =
    total.count > 0 ? (thumbsUp.count / total.count) * 100 : 0;

  return {
    total: total.count,
    thumbs_up: thumbsUp.count,
    thumbs_down: thumbsDown.count,
    satisfaction_rate: Math.round(satisfactionRate * 100) / 100,
  };
}

/**
 * Save a message to the database
 */
export function saveMessage(message: MessageRecord): void {
  const database = getDatabase();

  const stmt = database.prepare(`
    INSERT OR REPLACE INTO messages (id, conversation_id, role, content)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(
    message.id,
    message.conversation_id || null,
    message.role,
    message.content
  );
}

/**
 * Get message by ID
 */
export function getMessageById(id: string): MessageRecord | null {
  const database = getDatabase();

  const stmt = database.prepare("SELECT * FROM messages WHERE id = ?");
  return (stmt.get(id) as MessageRecord) || null;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
