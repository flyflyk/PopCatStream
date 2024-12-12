import json
from flask import Blueprint, render_template, jsonify
import sqlite3

channels_bp = Blueprint('channels', __name__)

@channels_bp.route('/channels', methods=['GET'])
def channels():
    return render_template('channels.html')

