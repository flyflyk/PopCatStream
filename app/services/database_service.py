import sqlite3

class DatabaseHandler:
    def __init__(self, db_path='instance/app.db'):
        self.db_path = db_path

    def initUsers(self):
        conn = sqlite3.connect(self.db_path)
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
    
    def initRooms(self):
        conn = sqlite3.connect(self.db_path)
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