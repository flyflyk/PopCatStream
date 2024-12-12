import sqlite3
import json

class UserHandler:
    def __init__(self, db_path='instance/app.db'):
        self.db_path = db_path

    def create_user(self, username, password, credits=0):
        """創建新用戶"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (username, password, credits, follows, fans) 
            VALUES (?, ?, ?, ?, ?)
        ''', (username, password, credits, json.dumps([]), json.dumps([])))
        conn.commit()
        conn.close()

    def get_user(self, username):
        """根據用戶名獲取用戶資料"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        conn.close()
        if user:
            return {
                'id': user[0],
                'username': user[1],
                'password': user[2],
                'credits': user[3],
                'follows': json.loads(user[4]),
                'fans': json.loads(user[5])
            }
        return None

    def update_user_field(self, username, field, value):
        """更新用戶某個字段"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(f'UPDATE users SET {field} = ? WHERE username = ?', (json.dumps(value), username))
        conn.commit()
        conn.close()

    def follow_user(self, follower, following):
        """用戶追蹤另一個用戶"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # 獲取兩個用戶資料
        follower_data = self.get_user(follower)
        following_data = self.get_user(following)

        if not follower_data or not following_data:
            return {"error": "User not found"}

        if following_data['id'] in follower_data['follows']:
            return {"message": "Already following"}

        # 更新追蹤列表
        follower_data['follows'].append(following_data['id'])
        following_data['fans'].append(follower_data['id'])

        # 保存數據
        self.update_user_field(follower, 'follows', follower_data['follows'])
        self.update_user_field(following, 'fans', following_data['fans'])

        return {"message": "Followed successfully"}

    def unfollow_user(self, follower, following):
        """用戶取消追蹤另一個用戶"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # 獲取兩個用戶資料
        follower_data = self.get_user(follower)
        following_data = self.get_user(following)

        if not follower_data or not following_data:
            return {"error": "User not found"}

        if following_data['id'] not in follower_data['follows']:
            return {"message": "Not following"}

        # 更新追蹤列表
        follower_data['follows'].remove(following_data['id'])
        following_data['fans'].remove(follower_data['id'])

        # 保存數據
        self.update_user_field(follower, 'follows', follower_data['follows'])
        self.update_user_field(following, 'fans', following_data['fans'])

        return {"message": "Unfollowed successfully"}

    def get_following(self, username):
        """獲取該用戶追蹤的所有用戶"""
        user = self.get_user(username)
        if not user:
            return {"error": "User not found"}
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT username FROM users WHERE id IN ({})'.format(
            ','.join('?' for _ in user['follows'])
        ), user['follows'])
        following = cursor.fetchall()
        conn.close()
        return [row[0] for row in following]

    def get_fans(self, username):
        """獲取該用戶的所有粉絲"""
        user = self.get_user(username)
        if not user:
            return {"error": "User not found"}
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT username FROM users WHERE id IN ({})'.format(
            ','.join('?' for _ in user['fans'])
        ), user['fans'])
        followers = cursor.fetchall()
        conn.close()
        return [row[0] for row in followers]
