import React, { useContext, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";

const Search = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState("");

  const { currentUser } = useContext(AuthContext);

  const handleSearch = async () => {
    setErr(""); // Clear previous errors
    setUser(null); // Clear previous search results

    if (username.trim() === "") {
      setErr("Username cannot be empty");
      return;
    }

    const q = query(
      collection(db, "users"),
      where("displayName", "==", username.trim())
    );

    try {
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setErr("User not found!");
        return;
      }

      // Assuming only one user will match the search
      const userDoc = querySnapshot.docs[0].data();
      setUser(userDoc);

    } catch (err) {
      console.error("Error searching for user:", err.message);
      setErr("An error occurred while searching.");
    }
  };

  const handleKey = (e) => {
    if (e.code === "Enter") handleSearch();
  };

  const handleSelect = async () => {
    // Check whether the group (chats in firestore) exists, if not create
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;
    
    try {
      const chatDoc = doc(db, "chats", combinedId);
      const res = await getDoc(chatDoc);

      if (!res.exists()) {
        // Create a chat in chats collection
        await setDoc(chatDoc, { messages: [] });

        // Create user chats
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Error handling chat creation:", err.message);
      setErr("An error occurred while creating chat.");
    }

    setUser(null);
    setUsername("");
  };

  return (
    <div className="search">
      <div className="searchForm">
        <input
          type="text"
          placeholder="  Find a user"
          onKeyDown={handleKey}
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
      </div>
      {err && <span className="error">{err}</span>}
      {user && (
        <div className="userChat" onClick={handleSelect}>
          <img src={user.photoURL} alt="User Avatar" />
          <div className="userChatInfo">
            <span>{user.displayName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
