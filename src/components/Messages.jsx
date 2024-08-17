import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Message from "./Message";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { data } = useContext(ChatContext);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      if (doc.exists()) {
        const fetchedMessages = doc.data().messages;
        console.log("Received messages data:", fetchedMessages); // Debugging line
        setMessages(fetchedMessages);
      } else {
        console.log("No such document!");
      }
    });

    return () => {
      unSub();
    };
  }, [data.chatId]);

  return (
    <div className="messages">
      {messages.map((m) => (
        <Message message={m} key={m.id} />
      ))}
    </div>
  );
};

export default Messages;
