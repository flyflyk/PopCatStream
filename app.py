from flask import Flask, render_template
from flask_cors import CORS
import sqlite3
from app.routes.auth_routes import auth_bp
from app.routes.stream_routes import stream_bp
from app.routes.profile_routes import profile_bp
from app.routes.channels_routes import channels_bp

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')
app.secret_key = 'KEY'

app.register_blueprint(auth_bp)
app.register_blueprint(stream_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(channels_bp)

# 啟用跨來源資源共享 (CORS)
CORS(app)

def init_users():
    conn = sqlite3.connect('instance/app.db')
    cursor = conn.cursor()

    # 檢查是否已存在 users 表
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
    table_exists = cursor.fetchone()

    # 如果表不存在，直接創建
    if not table_exists:
        cursor.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                credits REAL DEFAULT 0,
                follows TEXT DEFAULT '[]',
                fans TEXT DEFAULT '[]'
            );
        ''')
        print("Created 'users' table successfully.")
    else:
        print("'users' table exists, checking structure...")

        # 獲取現有列
        cursor.execute("PRAGMA table_info(users)")
        existing_columns = {col[1] for col in cursor.fetchall()}

        # 需要的列及其定義
        required_columns = {
            'id': "INTEGER PRIMARY KEY AUTOINCREMENT",
            'username': "TEXT UNIQUE NOT NULL",
            'password': "TEXT NOT NULL",
            'credits': "REAL DEFAULT 0",
            'follows': "TEXT DEFAULT '[]'",
            'fans': "TEXT DEFAULT '[]'"
        }

        # 檢查並添加缺失的列
        for column, definition in required_columns.items():
            if column not in existing_columns:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column} {definition}")
                print(f"Added missing column: {column}")

        # 檢查列的屬性是否正確
        for column, definition in required_columns.items():
            if column in existing_columns:
                try:
                    # 嘗試檢查數據完整性，SQLite 本身不強制屬性檢查
                    cursor.execute(f"SELECT {column} FROM users LIMIT 1")
                except sqlite3.OperationalError as e:
                    print(f"Warning: Column '{column}' might not match required format.")

    conn.commit()
    conn.close()
    print("Database initialized and updated successfully.")

def init_rooms():
    conn = sqlite3.connect('instance/app.db')
    cursor = conn.cursor()

    # 檢查是否已存在 rooms 表
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='rooms';")
    table_exists = cursor.fetchone()

    # 如果表不存在，直接創建
    if not table_exists:
        cursor.execute('''
            CREATE TABLE rooms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                creator TEXT NOT NULL,
                startFrom TEXT NOT NULL,
                watcher TEXT DEFAULT '[]'
            );
        ''')
        print("Created 'rooms' table successfully.")
    else:
        print("'rooms' table exists, checking structure...")

        # 獲取現有列
        cursor.execute("PRAGMA table_info(rooms)")
        existing_columns = {col[1] for col in cursor.fetchall()}

        # 需要的列及其定義
        required_columns = {
            'id': "INTEGER PRIMARY KEY AUTOINCREMENT",
            'title': "TEXT NOT NULL",
            'creator': "TEXT NOT NULL",
            'startFrom': "TEXT NOT NULL",
            'watcher': "TEXT DEFAULT '[]'"
        }

        # 檢查並添加缺失的列
        for column, definition in required_columns.items():
            if column not in existing_columns:
                cursor.execute(f"ALTER TABLE rooms ADD COLUMN {column} {definition}")
                print(f"Added missing column: {column}")

        # 檢查列的屬性是否正確
        for column, definition in required_columns.items():
            if column in existing_columns:
                try:
                    # 嘗試檢查數據完整性，SQLite 本身不強制屬性檢查
                    cursor.execute(f"SELECT {column} FROM rooms LIMIT 1")
                except sqlite3.OperationalError as e:
                    print(f"Warning: Column '{column}' might not match required format.")

    conn.commit()
    conn.close()
    print("Database initialized and updated successfully.")

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    init_users()
    init_rooms()
    app.run(debug=True)
