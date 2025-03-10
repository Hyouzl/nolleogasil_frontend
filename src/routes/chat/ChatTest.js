import React, { useCallback, useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";

const token = localStorage.getItem("token");
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

function ChatTest({ chatRoomId }) {
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const connect = useCallback(
    (onConnect, onMessage) => {
      const stompClient = new Client({
        brokerURL: "ws://api.partnerd.site:8080/chat", // Adjust based on your WebSocket URL
        connectHeaders: {
          // Optionally, you can pass headers here
        },
        onConnect: (frame) => {
          console.log("Connected: " + frame);
          onConnect();
        },
        onStompError: (frame) => {
          console.error("STOMP error: " + frame);
        },
        webSocketFactory: () => {
          return new SockJS("http://api.partnerd.site:8080/chat"); // Adjust based on your WebSocket URL
        },
      });

      stompClient.activate();

      // Subscribe to the chat room once the connection is established
      stompClient.subscribe(`/subscribe/chat/${chatRoomId}`, (message) => {
        if (onMessage) {
          onMessage(JSON.parse(message.body));
        }
      });
      setClient(stompClient);
    },
    [chatRoomId]
  );

  const sendMessage = (chatRoomId, message) => {
    const payload = JSON.stringify({
      chatRoomId,
      content: message,
      senderNickName: "User", // You can make this dynamic based on the logged-in user
      senderId: 1, // Adjust this based on the logged-in user
      collabAskId: 123, // Replace with your dynamic collabAskId
    });

    client.publish({
      destination: "/publish/message",
      body: payload,
    });
  };

  const disconnect = () => {
    if (client) {
      client.deactivate();
    }
  };

  const handleNewMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleMessageInputChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSendClick = () => {
    if (newMessage.trim() === "") return;
    sendMessage(chatRoomId, newMessage);
    setNewMessage("");
  };

  useEffect(() => {
    connect(() => {
      console.log("Connected to WebSocket");
    }, handleNewMessage);

    return () => {
      disconnect();
    };
  }, [connect, chatRoomId]);

  return (
    <div>
      <div>
        <h3>Chat Room {chatRoomId}</h3>
        <div style={{ maxHeight: "300px", overflowY: "scroll" }}>
          {messages.map((message, idx) => (
            <div key={idx}>
              <strong>{message.senderNickName}:</strong> {message.content}
            </div>
          ))}
        </div>
      </div>

      <div>
        <input
          type="text"
          value={newMessage}
          onChange={handleMessageInputChange}
          placeholder="Type a message"
        />
        <button onClick={handleSendClick}>Send</button>
      </div>
    </div>
  );
}

export default ChatTest;
