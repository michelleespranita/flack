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
hidden = True
showWarning = False

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
        print(conversations[channelName])
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
    channel_name = data['channel_name']
    message_time = data['message_time']
    message_sender = data['message_sender']
    message_text = data['message_text']
    if channel_name not in conversations.keys():
        conversations[channel_name] = [{'message_text': message_text, 'message_sender': message_sender, 'message_time': message_time}]
    else:
        if len(conversations[channel_name]) >= 100:
            del conversations[channel_name][0]
        conversations[channel_name].append({'message_text': message_text, 'message_sender': message_sender, 'message_time': message_time})
    emit('current messages', conversations, broadcast=True)


      
