import React, { useState } from 'react';
import './header.css';
import LoginPopup from './LoginPopup'; // Import LoginPopup component
import SignupPopup from './SignupPopup'; // Import SignupPopup component

const Header = () => {
    // State to track the popup visibility
    const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
    const [isSignupPopupOpen, setIsSignupPopupOpen] = useState(false);

    // Functions to open and close popups
    const openLoginPopup = () => {
        setIsSignupPopupOpen(false); // Close Signup if open
        setIsLoginPopupOpen(true);
    };
    const closeLoginPopup = () => setIsLoginPopupOpen(false);

    const openSignupPopup = () => {
        setIsLoginPopupOpen(false); // Close Login if open
        setIsSignupPopupOpen(true);
    };
    const closeSignupPopup = () => setIsSignupPopupOpen(false);

    return (
        <div>
            <div className="header">
                <div className="side1">
                    <div className="logo">
                        <img src="/logo.png" alt="Sonify Logo" />
                    </div>
                    <div className="logo-text">
                        <h2>Sonify</h2>
                    </div>
                </div>
                {/* <div className="side2">
                    <div className="loginbtn">
                        <button onClick={openLoginPopup}>LOG IN</button>
                    </div>
                    <div className="signupbtn">
                        <button onClick={openSignupPopup}>SIGN UP</button>
                    </div>
                </div> */}
            </div>

            <hr className="header-line" />

            {/* Show popups based on state */}
            {isLoginPopupOpen && (
                <LoginPopup 
                    onClose={closeLoginPopup} 
                    onSwitchToSignup={openSignupPopup} 
                />
            )}
            {isSignupPopupOpen && (
                <SignupPopup 
                    onClose={closeSignupPopup} 
                    onSwitchToLogin={openLoginPopup} 
                />
            )}
        </div>
    );
};

export default Header;
