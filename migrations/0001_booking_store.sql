CREATE TABLE IF NOT EXISTS booking_store (
 id INTEGER PRIMARY KEY CHECK (id = 1),
 content TEXT NOT NULL,
 version INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO booking_store (id, content, version) VALUES (1, '[]', 0);
