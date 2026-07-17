import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "../../config/firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./Login.css";

const Login = () => {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">HAMBIR</h1>
        <p className="login-subtitle">Sign in to continue</p>
        <button className="google-btn" onClick={handleGoogleLogin}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
