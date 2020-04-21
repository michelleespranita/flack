import os

from flask import Flask, session, request, render_template, url_for, redirect, flash, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
SECRET_KEY = os.urandom(32)
app.config["SECRET_KEY"] = SECRET_KEY
socketio = SocketIO(app)

channels = {} # contains tuples of (name, desc)
hidden = True
showWarning = False

@app.route("/", methods=["GET"])
def index():
    return render_template("begin.html")

@app.route("/home", methods=["GET"])
def home():
    global hidden
    global showWarning
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

      
