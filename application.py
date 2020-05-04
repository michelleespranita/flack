import os
import pandas as pd
from flask import Flask, session, request, render_template, url_for, redirect, flash, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
SECRET_KEY = os.urandom(32)
app.config["SECRET_KEY"] = SECRET_KEY
socketio = SocketIO(app)

channels = {} # list of (name, desc)
conversations = {} # contains key-value pair of (name, list of dictionaries containing chats)
# Ex: {'Mario Kart': [{'message_id': 1, 'message_sender': 'Michelle', 'message_text': 'Hahaha', 'message_time': '2020', 'reply_id': 0}, ...], ...}
# 0 is reserved for nothing
hidden = True
showWarning = False
global_id = 1

@app.route("/", methods=["GET"])
def index():
    return render_template("begin.html")

@app.route("/home", methods=["GET"])
def home():
    global hidden
    # print(hidden, showWarning)
    # return render_template("begin.html")
    print("HOME")
    return render_template("home.html", hidden=hidden)


@app.route("/check-channels", methods=["POST"])
def checkChannels():
    global channels
    if len(channels) > 0:
        return jsonify('True')
    else:
        return jsonify('False')

@app.route("/check-channels-exist", methods=["POST"])
def checkChannelsExist():
    channelName = request.form.get('channelName')
    if channelName in channels.keys():
        return jsonify('True')
    else:
        return jsonify('False')

@app.route("/get-channels", methods=["POST"])
def getChannels():
    global channels
    return jsonify(channels)

@app.route("/get-messages", methods=["POST"])
def getMessages():
    global conversations
    channelName = request.form.get('channel_name')
    if channelName in conversations.keys():
        return jsonify(conversations[channelName])
    else:
        return jsonify([])

@socketio.on('create channel')
def createChannel(data):
    channelName = data['channel_name']
    channelDesc = data['channel_desc']
    print(channelName, channelDesc)
    if channelName not in channels.keys():
        channels[channelName] = channelDesc
    emit('current channels', channels, broadcast=True)

@socketio.on('send message')
def send_message(data):
    global conversations
    global global_id
    channel_name = data['channel_name']
    message_time = data['message_time']
    message_sender = data['message_sender']
    message_text = data['message_text']
    reply_message_id = int(data['reply_id'])
    if channel_name not in conversations.keys():
        conversations[channel_name] = [{'message_id': global_id, 'message_text': message_text, 'message_sender': message_sender, 'message_time': message_time, 'reply_id': reply_message_id}]
    else:
        if len(conversations[channel_name]) >= 100:
            del conversations[channel_name][0]
        conversations[channel_name].append({'message_id': global_id, 'message_text': message_text, 'message_sender': message_sender, 'message_time': message_time, 'reply_id': reply_message_id})
    global_id += 1
    print(conversations)
    emit('current messages', conversations, broadcast=True)


      
