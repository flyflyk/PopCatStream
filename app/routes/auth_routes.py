import sqlite3
from flask import Blueprint, jsonify, redirect, url_for, request

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    username = request.form['username']
    password = request.form['password']
    
    # 保存帳戶資料到數據庫
    conn = sqlite3.connect('instance/app.db')
    cursor = conn.cursor()
    cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
    conn.commit()
    conn.close()
    return redirect(url_for('index')) 

@auth_bp.route('/check_username', methods=['POST'])
def check_username():
    data = request.get_json()
    username = data.get('username')

    conn = sqlite3.connect('instance/app.db')
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM users WHERE username = ?', (username,))
    count = cursor.fetchone()[0]  # 獲取查到的第一個結果
    conn.close()

    return jsonify({'exists': count > 0})

@auth_bp.route('/check_login', methods=['POST'])
def check_login():
    data = request.get_json()  
    username = data.get('username')
    password = data.get('password')

    # 用戶驗證
    conn = sqlite3.connect('instance/app.db')
    cursor = conn.cursor()
    cursor.execute('SELECT password FROM users WHERE username = ?', (username,))
    result = cursor.fetchone()
    if result is None:
        return jsonify({'success': False, 'errorCode': 1, 'message': '用戶名不存在'})
    elif result[0] != password:
        return jsonify({'success': False, 'errorCode': 2, 'message': '密碼不正確'})
    else :
        return jsonify({'success': True, 'errorCode': 0, 'message': '登入成功'})

@auth_bp.route('/login', methods=['POST'])
def login():
    return redirect(url_for('index'))