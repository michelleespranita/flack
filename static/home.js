document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.display-name-content').innerHTML = localStorage.getItem('displayName');

    // Check if there are channels created yet
    checkChannels();

    document.querySelector('#create-channel').onclick = () => {
        document.querySelector('.background-black').style.visibility = 'visible';
        document.querySelector('.create-channel-background').style.visibility = 'visible';
        document.querySelector('.create-channel-form').style.visibility = 'visible';                   
    };

    document.querySelector('.close-create-channel').onclick = () => {
        document.querySelector('.background-black').style.visibility = 'hidden';
        document.querySelector('.create-channel-background').style.visibility = 'hidden';
        document.querySelector('.create-channel-form').style.visibility = 'hidden';
        document.querySelector('.warning').style.visibility = 'hidden';
        openChannel(localStorage.getItem('lastChannel'));
    };

    document.querySelector('.info-icon').onclick = () => {
        var channel_name = document.querySelector('.channel-name').innerHTML;
        openDescByName(channel_name);
        if (document.querySelector('.desc-space').style.visibility === 'hidden') {
            document.querySelector('.desc-space').style.visibility = 'visible';
        } else {
            document.querySelector('.desc-space').style.visibility = 'hidden';
        }
    };

    // Load channels to menu
    loadChannels();
    
});

// Saves last opened channel
window.onunload = function() {
    localStorage.setItem('lastChannel', document.querySelector('#channel-name').innerHTML);
}

function checkChannels() {
    const request = new XMLHttpRequest();
    request.open('POST', '/check-channels');
    request.onload = () => {
        var channelsExist = JSON.parse(request.responseText);
        if (channelsExist === 'True') {
            // If yes, reopen last channel opened by user
            var lastChannel = localStorage.getItem('lastChannel');
            openChannel(lastChannel);
        } else {
            document.querySelector('#channel-name').innerHTML = "Start a channel!";
            document.querySelector('.info-icon').style.visibility = 'hidden';
            document.querySelector('.chat-input').style.visibility = 'hidden';
        }  
    }
    request.send();
}

function loadChannels() {
    const request = new XMLHttpRequest();
    request.open('POST', '/get-channels');
    request.onload = () => {
        var channels = JSON.parse(request.responseText);
        var channelNames = Object.keys(channels);
        var handlebars_channel = document.querySelector('#handlebars-channel');
        // Clear channels
        handlebars_channel.innerHTML = '';
        channelNames.forEach(function(channelName) {
            var a = document.createElement('a');
            a.className = 'open-channel';
            a.id = channelName;
            var div = document.createElement('div');
            div.className = 'menu-channel-names';
            div.innerHTML = channelName;
            a.appendChild(div);
            handlebars_channel.appendChild(a);
        });

        document.querySelectorAll('.open-channel').forEach(link => {
            link.onclick = () => {
                var idName = link.id;
                openChannel(idName);
            }
        });
    }
    request.send();
}

function openChannel(channel) {
    // Update lastChannel in localStorage
    localStorage.setItem('lastChannel', channel);
    // Print channel name
    document.querySelector('#channel-name').innerHTML = channel;
    // Make sure chat textarea is visible
    document.querySelector('.chat-input').style.visibility = 'visible';
    // Make sure desc icon is visible
    document.querySelector('.info-icon').style.visibility = 'visible';
    // Make sure description space is hidden
    document.querySelector('.desc-space').style.visibility = 'hidden';
    // Load messages
    const request = new XMLHttpRequest();
    request.open('POST', '/get-messages');
    request.onload = () => {
        var convos = JSON.parse(request.responseText);
        if (convos.length === 0) {
            var messages = document.querySelector('#messages');
            messages.className = 'messages2';
            messages.innerHTML = "No conversations yet";
        } else {
            const user = localStorage.getItem('displayName');
            var messages = document.querySelector('#messages');

            // Clear messages
            messages.innerHTML = "";
            messages.className = 'messages';
            messages.scrollTop = messages.scrollHeight - messages.clientHeight;

            convos.forEach(function(convo) {
                var message_row = document.createElement('div');
                message_row.classList.add('message-row');
                // Create message_id
                var message_id_elem = document.createElement('div');
                message_id_elem.style.visibility = 'hidden';
                message_id_elem.className = 'message-id';
                message_id_elem.innerHTML = convo['message_id'];
                // Create message_sender
                var message_sender_elem = document.createElement('div');
                if (convo['message_sender'] === user) {
                    message_row.classList.add('you-message');
                } else {
                    message_row.classList.add('other-message');
                }           
                message_sender_elem.innerHTML = convo['message_sender'];                
                message_sender_elem.className = 'message-sender';
                // Create message_text
                var message_text_link = document.createElement('a');
                message_text_link.className = 'message-text-link';
                message_text_link.href = '#';
                var message_text_elem = document.createElement('div');
                // ---- Create reply message ----
                var reply_id = convo['reply_id'];
                var reply_message_in_text_sender;
                var reply_message_in_text_text;
                if (reply_id !== 0) {
                    for (var i=0; i<convos.length; i++) {
                        if (convos[i]['message_id'] === reply_id) {
                            reply_message_in_text_sender = convos[i]['message_sender'];
                            reply_message_in_text_text = convos[i]['message_text'];
                            if (reply_message_in_text_text.length > 200) {
                                reply_message_in_text_text = reply_message_in_text_text.slice(0,200) + '...';
                            }
                        }                         
                    }
                    var reply_message_in_text_elem = document.createElement('div');

                    if (convo["message_sender"] === user) {
                        reply_message_in_text_elem.className = 'reply-you-message-in-text';
                    } else {
                        reply_message_in_text_elem.className = 'reply-other-message-in-text';
                    }

                    var reply_message_in_text_sender_elem = document.createElement('div');
                    reply_message_in_text_sender_elem.className = 'reply-message-in-text-sender';
                    reply_message_in_text_sender_elem.innerHTML = reply_message_in_text_sender;

                    var reply_message_in_text_text_elem = document.createElement('div');
                    reply_message_in_text_text_elem.className = 'reply-message-in-text-text';
                    reply_message_in_text_text_elem.innerHTML = reply_message_in_text_text;

                    reply_message_in_text_elem.appendChild(reply_message_in_text_sender_elem);
                    reply_message_in_text_elem.appendChild(reply_message_in_text_text_elem);

                    message_text_elem.appendChild(reply_message_in_text_elem);
                }
            
                // ------------------------------
                message_text_elem.innerHTML += convo['message_text'];
                message_text_elem.className = 'message-text';
                message_text_link.appendChild(message_text_elem);
                message_text_link.onclick = () => {
                    var chatSpace = document.querySelector('.chat-space');
                    chatSpace.style.gridTemplateRows = "10% 65% 10% 15%";
                    var reply_box = document.querySelector('.reply-box');
                    reply_box.style.visibility = 'visible';
                    var reply_message_id = document.querySelector('.reply-message-id');
                    reply_message_id.style.visibility = 'hidden';
                    reply_message_id.innerHTML = convo['message_id'];
                    var reply_message_sender = document.querySelector('.reply-message-sender');
                    reply_message_sender.innerHTML = convo['message_sender'];
                    var reply_message_text = document.querySelector('.reply-message-text');
                    reply_message_text.innerHTML = convo['message_text'];
                };
                // Create message_time
                var message_time_elem = document.createElement('div');
                message_time_elem.innerHTML = convo['message_time'];
                message_time_elem.className = 'message-time';
                // Add to message_row
                message_row.appendChild(message_id_elem);
                message_row.appendChild(message_sender_elem);
                message_row.appendChild(message_text_link);
                message_row.appendChild(message_time_elem);
                // Add message_row to messages
                messages.prepend(message_row);
            });
        }
    };

    const data = new FormData();
    data.append('channel_name', channel);
    // Send request.
    request.send(data);
}

function openDescByName(name) {
    const request = new XMLHttpRequest();
    request.open('POST', '/get-desc-by-name');
    request.onload = () => {
        var desc = JSON.parse(request.responseText);
        document.querySelector('.desc-space').innerHTML = desc;
    };
    const data = new FormData();
    data.append('channel_name', name);
    request.send(data);
}

function closeReplyBox() {
    var reply_box = document.querySelector('.reply-box');
    reply_box.style.visibility = 'hidden';
    var chatSpace = document.querySelector('.chat-space');
    chatSpace.style.gridTemplateRows = "10% 75% 0% 15%";
}


var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

socket.on('connect', () => {
    document.querySelector('#chatbox').onkeypress = (e) => {
        var message_text = document.querySelector('#chatbox').value;
        // If the user pressed Enter and the message contains letters that are not just line breaks and there's something to be sent (the user didn't just press Enter without typing anything first)
        if (e.charCode === 13 && message_text.match(/^[\n\r]+$/) === null && message_text.length >= 1) {
            message_text = message_text.replace(/\n/g, '<br>'); // g for global
            const channel_name = document.querySelector('#channel-name').innerHTML;
            const message_sender = localStorage.getItem('displayName');
            var now = new Date();
            var day = now.getDate();
            if (day < 10) {
                day = '0' + day;
            }
            var date = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + day;
            var time = now.getHours() + ':' + now.getMinutes();
            const message_time = date + ' ' + time;
            var reply_box = document.querySelector('.reply-box');
            if (reply_box.style.visibility === 'visible') {
                var reply_message_id = document.querySelector('.reply-message-id').innerHTML;
                socket.emit('send message', {'channel_name': channel_name, 'message_text': message_text, 'message_sender': message_sender, 'message_time': message_time, 'reply_id': reply_message_id});
                reply_box.style.visibility = 'hidden';
                var chatSpace = document.querySelector('.chat-space');
                chatSpace.style.gridTemplateRows = "10% 75% 0% 15%";
            } else {
                socket.emit('send message', {'channel_name': channel_name, 'message_text': message_text, 'message_sender': message_sender, 'message_time': message_time, 'reply_id': 0});
            }
            
        }
    };

    document.querySelector('.submit-channel').onclick = () => {
        var channelName = document.querySelector('.channel-name-input').value;
        var channelDesc = document.querySelector('.channel-desc').value;
        // Check if channel already exists
        const request = new XMLHttpRequest();
        request.open('POST', '/check-channels-exist');
        request.onload = () => {
            var channelExists = JSON.parse(request.responseText);
            if (channelExists === 'True') {
                // Channel already exists
                document.querySelector('.warning').style.visibility = 'visible';

            } else {
                // Channel hasn't existed
                document.querySelector('.background-black').style.visibility = 'hidden';
                document.querySelector('.create-channel-background').style.visibility = 'hidden';
                document.querySelector('.create-channel-form').style.visibility = 'hidden';
                document.querySelector('.warning').style.visibility = 'hidden';
                socket.emit('create channel', {'channel_name': channelName, 'channel_desc': channelDesc});
            }
        };

        const data = new FormData();
        data.append('channelName', channelName);
        request.send(data);
    };        
});

socket.on('current messages', data => {
    const channel_name = document.querySelector('#channel-name').innerHTML;
    var convos = data[channel_name]; // a list of dictionaries. The dictionaries are messages.
    const user = localStorage.getItem('displayName');
    var messages = document.querySelector('#messages');
    // Clear textbox
    document.querySelector('#chatbox').value = "";
    // Clear messages
    messages.innerHTML = "";
    messages.className = 'messages';
    messages.scrollTop = messages.scrollHeight - messages.clientHeight;

    convos.forEach(function(convo) {
        var message_row = document.createElement('div');
        message_row.classList.add('message-row');
        // Create message_id
        var message_id_elem = document.createElement('div');
        message_id_elem.style.visibility = 'hidden';
        message_id_elem.className = 'message-id';
        message_id_elem.innerHTML = convo['message_id'];
        // Create message_sender
        var message_sender_elem = document.createElement('div');
        if (convo['message_sender'] === user) {
            message_row.classList.add('you-message');
        } else {
            message_row.classList.add('other-message');
        }
        message_sender_elem.innerHTML = convo['message_sender'];                        
        message_sender_elem.className = 'message-sender';
        // Create message_text
        var message_text_link = document.createElement('a');
        message_text_link.className = 'message-text-link';
        message_text_link.href = '#';
        var message_text_elem = document.createElement('div');
        // ---- Create reply message ----
        var reply_id = convo['reply_id'];
        var reply_message_in_text_sender;
        var reply_message_in_text_text;
        if (reply_id !== 0) {
            for (var i=0; i<convos.length; i++) {
                if (convos[i]['message_id'] === reply_id) {
                    reply_message_in_text_sender = convos[i]['message_sender'];
                    reply_message_in_text_text = convos[i]['message_text'];
                    if (reply_message_in_text_text.length > 200) {
                        reply_message_in_text_text = reply_message_in_text_text.slice(0,200) + '...';
                    }
                }                         
            }
            var reply_message_in_text_elem = document.createElement('div');

            if (convo["message_sender"] === user) {
                reply_message_in_text_elem.className = 'reply-you-message-in-text';
            } else {
                reply_message_in_text_elem.className = 'reply-other-message-in-text';
            }

            var reply_message_in_text_sender_elem = document.createElement('div');
            reply_message_in_text_sender_elem.className = 'reply-message-in-text-sender';
            reply_message_in_text_sender_elem.innerHTML = reply_message_in_text_sender;

            var reply_message_in_text_text_elem = document.createElement('div');
            reply_message_in_text_text_elem.className = 'reply-message-in-text-text';
            reply_message_in_text_text_elem.innerHTML = reply_message_in_text_text;

            reply_message_in_text_elem.appendChild(reply_message_in_text_sender_elem);
            reply_message_in_text_elem.appendChild(reply_message_in_text_text_elem);

            message_text_elem.appendChild(reply_message_in_text_elem);
        }
       
        // ------------------------------
        message_text_elem.innerHTML += convo['message_text'];
        message_text_elem.className = 'message-text';
        message_text_link.appendChild(message_text_elem);
        message_text_link.onclick = () => {
            var chatSpace = document.querySelector('.chat-space');
            chatSpace.style.gridTemplateRows = "10% 65% 10% 15%";
            var reply_box = document.querySelector('.reply-box');
            reply_box.style.visibility = 'visible';
            var reply_message_id = document.querySelector('.reply-message-id');
            reply_message_id.innerHTML = convo['message_id'];
            reply_message_id.style.visibility = 'hidden';
            var reply_message_sender = document.querySelector('.reply-message-sender');
            reply_message_sender.innerHTML = convo['message_sender'];
            var reply_message_text = document.querySelector('.reply-message-text');
            reply_message_text.innerHTML = convo['message_text'];
        };

        // Create message_time
        var message_time_elem = document.createElement('div');
        message_time_elem.innerHTML = convo['message_time'];
        message_time_elem.className = 'message-time';
        // Add to message_row
        message_row.appendChild(message_id_elem);
        message_row.appendChild(message_sender_elem);
        message_row.appendChild(message_text_link);
        message_row.appendChild(message_time_elem);
        // Add message_row to messages
        messages.prepend(message_row);
    });
});

socket.on('current channels', data => {
    var channels = data; // a dictionary of channels
    var channelNames = Object.keys(channels);
    var handlebars_channel = document.querySelector('#handlebars-channel');
    // Clear channels
    handlebars_channel.innerHTML = '';
    channelNames.forEach(function(channelName) {
        var a = document.createElement('a');
        a.className = 'open-channel';
        a.id = channelName;
        var div = document.createElement('div');
        div.className = 'menu-channel-names';
        div.innerHTML = channelName;
        a.appendChild(div);
        handlebars_channel.appendChild(a);
    });

    document.querySelectorAll('.open-channel').forEach(link => {
        link.onclick = () => {
            var idName = link.id;
            openChannel(idName);
        }
    });

});