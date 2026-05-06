import React, { useState, useEffect } from "react";
import "./LoginPopup.css";

const LoginPopup = ({ onClose, onSwitchToSignup }) => {
  const [isExiting, setIsExiting] = useState(false);

  // Function to handle clicking outside the popup to close it
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle closing with exit animation
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(); // Remove popup after animation is finished
    }, 500); // Match the duration of the animation
  };

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [onClose]);

  return (
    <div
      className={`login-popup-overlay ${isExiting ? "exit-animation" : ""}`}
      onClick={handleOverlayClick}
    >
      <div className={`login-popup ${isExiting ? "popup-exit" : ""}`}>
        <h2>Login to your account</h2>
        <form>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <div className="popup-footer">
          <a href="#">Forgot Password?</a>
          <p>
            New to Sonify?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onSwitchToSignup) {
                  onSwitchToSignup(); // Switch to Signup Popup
                } else {
                  console.error("onSwitchToSignup is not defined");
                }
              }}
            >
              Create account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
