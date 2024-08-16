import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";

const Chats = () => {
  const [chats, setChats] = useState({}); // Initialize as an empty object

  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        const data = doc.data() || {}; // Default to empty object if no data
        console.log('Received chats data:', data);
        setChats(data);
      });

      return () => {
        unsub();
      };
    };

    getChats();
  }, [currentUser?.uid]);

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  return (
    <div className="chats">
      {Object.entries(chats)
        ?.sort((a, b) => b[1].date - a[1].date) // Sort chats by date
        .map(([key, chat]) => (
          <div
            className="userChat"
            key={key}
            onClick={() => handleSelect(chat.userInfo)}
          >
            <img src={chat.userInfo?.photoURL} alt="" />
            <div className="userChatInfo">
              <span>{chat.userInfo?.displayName}</span>
              <p>{chat.lastMessage?.text}</p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Chats;
