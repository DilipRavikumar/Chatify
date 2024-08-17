import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const formatTime = (date) => {
    console.log("Received Date:", date);
    console.log("Date Type:", typeof date);

    if (date instanceof Timestamp) {
      // Convert Firestore Timestamp to JavaScript Date
      return format(date.toDate(), "hh:mm a");
    } else if (date instanceof Date) {
      // If already a Date object
      return format(date, "hh:mm a");
    } else if (typeof date === 'string') {
      // Try to parse the string if it's a date
      try {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return format(parsedDate, "hh:mm a");
        }
      } catch (error) {
        console.error("Error parsing date string:", error);
      }
      return "Unknown time";
    } else {
      return "Unknown time";
    }
  };

  return (
    <div
      ref={ref}
      className={`message ${message.senderId === currentUser.uid && "owner"}`}
    >
      <div className="messageInfo">
        <img
          src={
            message.senderId === currentUser.uid
              ? currentUser.photoURL
              : data.user.photoURL
          }
          alt="User Avatar"
        />
        <span>{formatTime(message.date)}</span>
      </div>
      <div className="messageContent">
        <p>{message.text}</p>
        {message.img && <img src={message.img} alt="Message Attachment" />}
      </div>
    </div>
  );
};

export default Message;
