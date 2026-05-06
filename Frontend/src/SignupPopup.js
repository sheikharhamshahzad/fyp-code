import React, { useState, useEffect } from 'react';
import './SignupPopup.css';

const SignupPopup = ({ onClose, onSwitchToLogin }) => {
    const [closing, setClosing] = useState(false);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setClosing(true);
            setTimeout(() => onClose(), 400); // Wait for animation to complete
        }
    };

    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                setClosing(true);
                setTimeout(() => onClose(), 400);
            }
        };
        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [onClose]);

    return (
        <div
            className={`signup-popup-overlay ${closing ? 'fade-out' : ''}`}
            onClick={handleOverlayClick}
        >
            <div className={`signup-popup ${closing ? 'slide-out' : ''}`}>
                <div className="signup-left">
                    <h2>Get started with Sonify</h2>
                    <form>
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Password" />
                        <button type="submit" className="signup-button">
                            Create Account
                        </button>
                    </form>
                    <p className="signup-footer">
                        By signing up, you accept our terms and privacy policy. <br />
                    </p>
                    <p className="already-have-account">
                        Already signed up?{' '}
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (onSwitchToLogin) {
                                    onSwitchToLogin();
                                } else {
                                    console.error('onSwitchToLogin is not defined');
                                }
                            }}
                        >
                            Log in
                        </a>
                    </p>
                </div>
                <div className="signup-right">
                    <div className="illustration">
                        <img src="/signup.png" alt="Signup illustration" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPopup;
