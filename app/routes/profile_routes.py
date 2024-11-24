import json
from flask import Blueprint, render_template, request, session, redirect, url_for, jsonify
import sqlite3

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/profile', methods=['GET'])
def profile():
    username = request.args.get('username')
    conn = sqlite3.connect('instance/app.db')
    cursor = conn.cursor()

    # 查詢用戶資料
    cursor.execute('SELECT username, credits, follows, fans FROM users WHERE username = ?', (username,))
    user_data = cursor.fetchone()
    conn.close()

    if not user_data:
        return jsonify({'error': '用戶資料不存在'}), 404

    # 將 follows 和 fans 從 JSON 格式轉換為 Python 列表
    follows_list = json.loads(user_data[2]) if user_data[2] else []
    fans_list = json.loads(user_data[3]) if user_data[3] else []

    # 返回用戶頁面
    return render_template('profile.html',
                           username=user_data[0],
                           credits=user_data[1],
                           followed_creators=follows_list,
                           fans_list=fans_list)

