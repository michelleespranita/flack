import os
import pandas as pd
from flask import Flask, session, request, render_template, url_for, redirect, flash, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
SECRET_KEY = os.urandom(32)
app.config["SECRET_KEY"] = SECRET_KEY
socketio = SocketIO(app)

channels = {} # contains key-value pair of (name, desc)
conversations = {} # contains key-value pair of (name, dataframe)
hidden = True
showWarning = False

@app.route("/", methods=["GET"])
def index():
    return render_template("begin.html")

@app.route("/home", methods=["GET"])
def home():
    global hidden
    global showWarning
    print(hidden, showWarning)
    return render_template("home.html", channels=channels, hidden=hidden, showWarning=showWarning)

@app.route("/create-channel", methods=["POST"])
def createChannel():
    global hidden
    global showWarning
    print('createChannel')
    name = request.form.get('channelName')
    desc = request.form.get('channelDesc')
    print(name, desc)
    if name in channels.keys():
        print("Name exists.")
        hidden = False
        showWarning = True
        return redirect(url_for('home'))
    else:
        channels[name] = desc
        hidden = True
        showWarning = False
        return redirect(url_for('home'))

@app.route("/get-messages", methods=["GET"])
def getMessages():
    global conversations
    channelName = request.form.get('channel_name')
    return conversations[channelName]

@socketio.on('send message')
def send_message(data):
    global conversations
    channel_name = data['channel_name']
    message_time = data['message_time']
    message_sender = data['message_sender']
    message_text = data['message_text']
    if channel_name not in conversations:
        conversations[channel_name] = [{'message_text': message_text, 'message_sender': message_sender, 'message_time': message_time}]
    else:
        conversations[channel_name].append({'message_text': message_text, 'message_sender': message_sender, 'message_time': message_time})
    emit('current messages', conversations, broadcast=True)


      
