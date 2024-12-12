from flask import Blueprint, render_template

stream_bp = Blueprint('stream', __name__)

@stream_bp.route('/createLive', methods=['GET'])
def createLive():
    return render_template('live_streamer.html')

@stream_bp.route('/joinLive', methods=['GET'])
def joinLive():
    return render_template('live_watcher.html')