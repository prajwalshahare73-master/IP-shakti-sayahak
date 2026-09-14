import sqlite3
import json
import os
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "ip_sakthi_db.sqlite"

def get_connection():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Cases Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cases (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            title TEXT NOT NULL,
            status TEXT NOT NULL,
            profile_data TEXT,
            builder_data TEXT,
            events_data TEXT,
            ai_answer_data TEXT,
            expert_id TEXT,
            expert_domain TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    """)
    
    # AI Answers Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_answers (
            query_id TEXT PRIMARY KEY,
            case_id TEXT,
            question TEXT NOT NULL,
            answer_data TEXT NOT NULL,
            created_at TEXT
        )
    """)
    
    # Conversations Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            session_id TEXT,
            user_id TEXT,
            title TEXT,
            created_at TEXT
        )
    """)
    
    # Messages Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            sender_type TEXT NOT NULL,
            sender_id TEXT,
            content TEXT NOT NULL,
            metadata TEXT,
            created_at TEXT
        )
    """)
    
    conn.commit()
    conn.close()

# Auto-initialize SQLite database schema on module import
init_db()
