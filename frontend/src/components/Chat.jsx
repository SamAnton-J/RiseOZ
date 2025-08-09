import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import '../static/css/components/Chat.css'

import { API_BASE_URL } from '../api/config';
const socket = io(API_BASE_URL);

const Chat = ({ senderId, senderRole, receiverId, receiverRole, receiverUsername }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [trigger, setTrigger] = useState(false);
    // console.log(token)

    // console.log(senderId, senderRole, receiverId, receiverRole, receiverUsername);
    // console.log(messages)
    useEffect(() => {
        socket.emit('join', { senderId, senderRole });

        socket.on('receiveMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        const fetchMessages = async () => {
            try {
                axios
                    .get(`${API_BASE_URL}/chat/${senderId}/${senderRole}/${receiverId}/${receiverRole}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    .then((response) => {
                        setMessages(response.data);
                    })
            } catch (error) {
                console.error('Failed to fetch messages:', error);
                setMessages([]);
            }
        };

        fetchMessages();

        return () => {
            socket.off('receiveMessage');
        };
    }, [senderId, senderRole, receiverId, receiverRole, trigger]);

    const sendMessage = () => {
        const newMessage = {
            senderId: senderId,
            senderRole: senderRole,
            receiverId: receiverId,
            receiverRole: receiverRole,
            content: message,
            timestamp: new Date().toISOString()
        };
        socket.emit('sendMessage', newMessage);
        // console.log(newMessage.senderRole)
        // console.log(newMessage.receiverRole)
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        // messages.forEach((msg) => {
        //     if (msg.sender === senderId) {
        //         console.log('Sender:', msg.content);
        //     } else {
        //         console.log('Receiver:', msg.content);
        //     }
        // });
        setTrigger(!trigger);
        setMessage('');
    };

    if (token === null) {
        return (
            <div>
                <h1>Unauthorized, Please Signin <a href="/signin">Here</a></h1>
            </div>
        )
    }
    else {
        return (
            <>
                <div className='chat_section_main'>
                    <div className='chat_section_main_msg_area'>
                        {
                            Array.isArray(messages) && messages.length > 0 ?
                                (
                                    messages.map((msg, index) => {
                                        // console.log(msg.sender, senderId)
                                        return (
                                            <div className={(msg.sender === senderId) ? 'sent_message' : 'received_message'} key={index}>
                                                <span>{msg.content}</span>
                                            </div>
                                        )
                                    })
                                )
                                :
                                (
                                    <span>No Message Yet With {receiverUsername}</span>
                                )
                        }
                    </div>
                    <div className='chat_section_main_msg_box'>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            </>
        );
    }
};

export default Chat;
