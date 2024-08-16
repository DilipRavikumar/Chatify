import React, { useContext, useState } from "react";
import Img from "../img/img.png";
import Attach from "../img/attach.png";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import {
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const handleSend = async () => {
    setLoading(true);
    setError(null);

    try {
      if (img) {
        const storageRef = ref(storage, `images/${uuid()}`);
        const uploadTask = uploadBytesResumable(storageRef, img);

        uploadTask.on(
          "state_changed",
          null, // Optional: handle progress here
          (error) => {
            console.error("Upload failed:", error);
            setError("Failed to upload image.");
            setLoading(false);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              await updateDoc(doc(db, "chats", data.chatId), {
                messages: arrayUnion({
                  id: uuid(),
                  text,
                  senderId: currentUser.uid,
                  date: Timestamp.now(),
                  img: downloadURL,
                }),
              });

              await updateDoc(doc(db, "userChats", currentUser.uid), {
                [data.chatId + ".lastMessage"]: {
                  text,
                },
                [data.chatId + ".date"]: serverTimestamp(),
              });

              await updateDoc(doc(db, "userChats", data.user.uid), {
                [data.chatId + ".lastMessage"]: {
                  text,
                },
                [data.chatId + ".date"]: serverTimestamp(),
              });
            } catch (error) {
              console.error("Failed to update Firestore with image URL:", error);
              setError("Failed to send message.");
            } finally {
              setLoading(false);
            }
          }
        );
      } else {
        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text,
            senderId: currentUser.uid,
            date: Timestamp.now(),
          }),
        });

        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [data.chatId + ".lastMessage"]: {
            text,
          },
          [data.chatId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", data.user.uid), {
          [data.chatId + ".lastMessage"]: {
            text,
          },
          [data.chatId + ".date"]: serverTimestamp(),
        });

        setLoading(false);
      }

      setText("");
      setImg(null);
      setImgPreview(null);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImg(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClosePreview = () => {
    setImg(null);
    setImgPreview(null);
  };

  return (
    <div className="input">
      <input
        type="text"
        placeholder="Type something..."
        onChange={(e) => setText(e.target.value)}
        value={text}
      />
      <div className="send">
        <label htmlFor="file">
          <img src={Attach} alt="Attach file" />
        </label>
        <input
          type="file"
          style={{ display: "none" }}
          id="file"
          onChange={handleFileChange}
        />
        <label htmlFor="file">
          <img src={Img} alt="Upload file" />
        </label>
        <button onClick={handleSend} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
      {imgPreview && (
        <div className="img-preview">
          <img src={imgPreview} alt="Preview" />
          <button onClick={handleClosePreview} className="close-btn">
            &times;
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Input;
