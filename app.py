from flask import Flask, render_template
from flask_cors import CORS
import sqlite3
from app.routes.auth_routes import auth_bp
from app.routes.stream_routes import stream_bp

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')
app.secret_key = 'KEY'

app.register_blueprint(auth_bp)
app.register_blueprint(stream_bp)

# 啟用跨來源資源共享 (CORS)
CORS(app)

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

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    create_users_table()
    app.run(debug=True)
