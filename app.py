from flask import Flask, redirect, render_template, request, url_for
from flask_mail import Mail
from flask_cors import CORS

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')

# 初始化 Flask-Mail
mail = Mail(app)

# 啟用跨來源資源共享 (CORS)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/signup', methods=['POST'])
def signup():
    # 獲取表單數據
    username = request.form['username']
    password = request.form['password']
    email = request.form['email']
    
    # 保存帳戶資料到數據庫

    return redirect(url_for('index'))  # 成功後重新導向主頁

@app.route('/login', methods=['POST'])
def login():
    # 獲取表單數據
    username = request.form['username']
    password = request.form['password']

    # 用戶驗證

    return redirect(url_for('index'))  # 成功後重新導向主頁

if __name__ == '__main__':
    # 啟動應用
    app.run(debug=True)
