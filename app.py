from flask import Flask, render_template
from flask_cors import CORS
from app.routes.auth_routes import auth_bp
from app.routes.stream_routes import stream_bp
from app.routes.profile_routes import profile_bp
from app.routes.channels_routes import channels_bp
from app.services.database_service import DatabaseHandler

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')
app.secret_key = 'KEY'
dbHandler = DatabaseHandler()

app.register_blueprint(auth_bp)
app.register_blueprint(stream_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(channels_bp)

# 啟用跨來源資源共享 (CORS)
CORS(app, origins="https://20.92.229.26:8444")

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    dbHandler.initUsers()
    dbHandler.initRooms()
    app.run(host='0.0.0.0',debug=True, port=8443, ssl_context=('cert.pem', 'key.pem'))
   