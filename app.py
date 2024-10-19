from flask import Flask, jsonify, redirect, render_template, request, url_for
from flask_cors import CORS
import sqlite3

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')

# 啟用跨來源資源共享 (CORS)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/signup', methods=['POST'])
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

@app.route('/check_username', methods=['POST'])
def check_username():
    data = request.get_json()
    username = data.get('username')

    conn = sqlite3.connect('instance/app.db')
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM users WHERE username = ?', (username,))
    count = cursor.fetchone()[0]  # 獲取查到的第一個結果
    conn.close()

    return jsonify({'exists': count > 0})

@app.route('/check_login', methods=['POST'])
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

@app.route('/login', methods=['POST'])
def login():
    return redirect(url_for('index'))

def create_users_table():
    conn = sqlite3.connect('instance/app.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    create_users_table()
    app.run(debug=True)
