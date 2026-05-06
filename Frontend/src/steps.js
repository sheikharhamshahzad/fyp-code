import React from 'react';
import { useNavigate } from 'react-router-dom';
import './steps.css';

const Steps = () => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/upload');
    };

    return (
        <div>
            <div className="steps-container">
                <div className="primary-text">
                    <h2>Advanced AI Audio Processing for Unmatched Clarity</h2>
                </div>

                <div className="secondary-text">
                    <p>
                        In today's digital world, crystal-clear audio is essential for seamless communication and professional content creation. Whether you're working on presentations, corporate training materials, or any form of digital media, producing high-quality audio is crucial for effective engagement. Sonify is here to elevate your audio experience, providing cutting-edge technology that enhances spoken audio with precision. Our platform offers real-time noise reduction and clarity enhancement, leveraging advanced machine learning to deliver a polished, professional sound effortlessly. Transform your audio productions with Sonify and experience unparalleled audio quality today!
                    </p>
                </div>

                <div className="steps-text">
                    <h2>Enhance Audio in 3 Simple Steps</h2>
                </div>

                <div className="steps-image">
                    <img src="/steps.jpg" alt="Steps Illustration"></img>
                </div>

                <div className="stepsbtn">
                    <button onClick={handleNavigate}>Explore Your Journey</button>
                </div>
            </div>
        </div>
    );
};

export default Steps;
