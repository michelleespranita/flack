import os

from flask import Flask, session, request, render_template, url_for, redirect, flash
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/", methods=["GET"])
def index():
    return render_template("begin.html")

@app.route("/home", methods=["GET"])
def home():
    return render_template("home.html")
