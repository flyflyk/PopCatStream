from flask import Flask, render_template, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from app.routes.auth_routes import auth_bp
from app.routes.stream_routes import stream_bp
from app.routes.profile_routes import profile_bp
from app.routes.channels_routes import channels_bp
from app.services.database_service import DatabaseHandler

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')
app.secret_key = 'KEY'
socketio = SocketIO(app, cors_allowed_origins="*")
dbHandler = DatabaseHandler()
users = set()

app.register_blueprint(auth_bp)
app.register_blueprint(stream_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(channels_bp)

# 啟用跨來源資源共享 (CORS)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def on_connect():
    users.add(request.sid)
    emit('connected', {'id': request.sid})  # 向新連接的用戶發送自己的 ID
    for user in users:
        if user != request.sid:
            emit('new-user', request.sid, to=user)


@socketio.on('disconnect')
def on_disconnect():
    users.remove(request.sid)
    emit('user-disconnected', request.sid, broadcast=True)

@socketio.on('offer')
def on_offer(data):
    emit('offer', data, to=data['to'])

@socketio.on('answer')
def on_answer(data):
    emit('answer', data, to=data['to'])

@socketio.on('ice-candidate')
def on_ice_candidate(data):
    emit('ice-candidate', data, to=data['to'])

@socketio.on('message')
def handle_message(data):
    emit('message', data, broadcast=True)  # 將訊息發送給所有連接的用戶

if __name__ == '__main__':
    dbHandler.initUsers()
    dbHandler.initRooms()
    app.run(host='0.0.0.0',debug=True, port=8443, ssl_context=('cert.pem', 'key.pem'))
   