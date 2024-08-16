import React, { useState } from "react";
import Add from "../img/addAvatar.png";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    try {
      // Create user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Create a unique image name
      const date = new Date().getTime();
      const storageRef = ref(storage, `avatars/${displayName + date}`);

      await uploadBytesResumable(storageRef, file).then(async () => {
        const downloadURL = await getDownloadURL(storageRef);

        try {
          // Update profile
          await updateProfile(res.user, {
            displayName,
            photoURL: downloadURL,
          });

          // Create user on Firestore
          await setDoc(doc(db, "users", res.user.uid), {
            uid: res.user.uid,
            displayName,
            email,
            photoURL: downloadURL,
          });

          // Create empty user chats on Firestore
          await setDoc(doc(db, "userChats", res.user.uid), {});

          navigate("/");
        } catch (err) {
          console.error("Error updating profile or Firestore:", err.message);
          setErr("Error updating profile or Firestore.");
        } finally {
          setLoading(false);
        }
      });
    } catch (err) {
      console.error("Error creating user:", err.message);
      setErr("Error creating user.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create user on Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });

      // Create empty user chats on Firestore
      await setDoc(doc(db, "userChats", user.uid), {});

      navigate("/");
    } catch (err) {
      console.error("Error with Google Sign-In:", err.message);
      setErr("Error with Google Sign-In.");
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Chatify</span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input required type="text" placeholder="Display Name" />
          <input required type="email" placeholder="Email" />
          <input required type="password" placeholder="Password" />
          <input required style={{ display: "none" }} type="file" id="file" />
          <label htmlFor="file">
            <img src={Add} alt="Add Avatar" />
            <span>Add an avatar</span>
          </label>
          <button type="submit" disabled={loading}>
            Sign Up
          </button>
          {loading && <p>Uploading and compressing the image. Please wait...</p>}
          {err && <p className="error">{err}</p>}
        </form>
        <button onClick={handleGoogleSignIn} disabled={loading}>
          Sign in with Google
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
