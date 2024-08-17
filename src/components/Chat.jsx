import React, { useContext, useState, useEffect } from "react";
import Cam from "../img/cam.png";
import Add from "../img/add.png";
import More from "../img/more.png";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase"; // Adjust the path as necessary
import { doc, getDoc } from "firebase/firestore";

const Chat = () => {
  const { data } = useContext(ChatContext);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  const handleProfileClick = () => {
    setShowUserInfo(!showUserInfo);
  };

  // Fetch user email when chat data changes
  useEffect(() => {
    const fetchUserEmail = async () => {
      if (data.user?.uid) { // Ensure user ID is available
        try {
          const userDocRef = doc(db, "users", data.user.uid); // Adjust collection name if needed
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserEmail(userDoc.data().email); // Ensure 'email' field exists
          } else {
            console.error("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user email:", error);
        }
      }
    };

    fetchUserEmail();
  }, [data.user?.uid]);

  return (
    <div className="chat">
      <div className="chatInfo">
        <div className="profile-container" onClick={handleProfileClick}>
          <img
            src={data.user?.photoURL || "defaultProfilePicURL"}
            alt="Profile"
            className="profile-pic"
          />
        </div>
        <span className="chat-name">{data.user?.displayName}</span>
        <div className="chatIcons">
          <img src={Cam} alt="Camera" />
          <img src={Add} alt="Add" />
          <img src={More} alt="More" />
        </div>
      </div>

      {showUserInfo && (
        <div className="user-info-modal">
          <p><strong>Name:</strong> {data.user?.displayName}</p>
          <p><strong>Email:</strong> {userEmail || "Email not available"}</p>
          <button onClick={() => setShowUserInfo(false)}>Close</button>
        </div>
      )}

      <Messages />
      <Input />
    </div>
  );
};

export default Chat;
