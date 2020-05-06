# About the Project

This is the second project I have done for CS50’s Web Programming with Python and Javascript class on edx.org.
The objectives of the project were:
* Learn to use JavaScript to run code server-side.
* Become more comfortable with building web user interfaces.
* Gain experience with Socket.IO to communicate between clients and servers.

# Features

1. **Display Name**: Before entering the website, users are prompted to type in a display name. The display name can't be empty. Otherwise, an alert is issued.
2. **Channel Creation**: Users can create channels, in which they specify the name and description of the channel. The name must be unique. The description is optional and not unique.
3. **Channel List**: The list of channels is displayed on the left side of the application.
4. **Sending Messages**: Users can send messages to each other via different browsers. Messages are displayed in the form of chat bubbles, and each chat bubble has a display name and timestamp associated to it. In order to send or receive messages, the page does not have to be reloaded.
5. **Messages View**: Users can look at up to maximum 100 messages in a channel.
6. **Remembering the Channel**: The application can remember what channel the user was last in before he/she closes the browser window, so that the channel will be displayed again when the user reopens the application.
7. **Personal Touch: Reply Function**: Users can reply to each other's (or their own) messages by clicking on the corresponding chat bubble.

# Installation

1. Download this repository.
2. As a good practice, create a virtual environment where you can keep all the packages you need for this application. For this project, I’ve uploaded the virtual environment I’ve created. To run it, make sure you are inside the project’s directory and type: `source venv/bin/activate` on Terminal.
3. Install all the packages needed by executing: `pip3 install -r requirements.txt` on Terminal.
4. Enter the “app” directory by executing: `cd app`
5. Set the environment variables needed by the application:
   * `export FLASK_APP=application.py`
6. Run the application: `flask run`
7. Go to the local address specified by typing it in your browser, most likely: http://127.0.0.1:5000/
