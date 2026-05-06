import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./options.css";

const Options = () => {
    const [selectedOption, setSelectedOption] = useState(null);
    const navigate = useNavigate();

    const handleOptionClick = (option) => {
        setSelectedOption(option);
    };

    const handleStartClick = () => {
        if (selectedOption) {
            navigate(`/process/${selectedOption}`);
        } else {
            alert("Please select a feature type before proceeding.");
        }
    };

    return (
        <div className="options-container">
            <header className="upload-header">
                <img src="/logo.png" alt="Logo" className="upload-logo" />
                <span className="upload-logo-text">Sonify</span>
            </header>
            <h1 className="upload-title">AI Audio Enhancer</h1>

            <div className="options-box">
                <div className="options-grid">
                    {[
                        "Sonify Magic",
                        "Denoise",
                        "Translate with Voice Retention",
                        "Sentiment Analysis",
                        "Isolate Speaker",
                    ].map((option, index) => (
                        <div
                            key={index}
                            className={`option-card ${
                                selectedOption === option ? "selected" : ""
                            }`}
                            onClick={() => handleOptionClick(option)}
                        >
                            <span className="option-text">{option}</span>
                            <button className="option-play-button">
                                <i className="fas fa-play"></i>
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    className={`start-button ${selectedOption ? "active" : ""}`}
                    onClick={handleStartClick}
                >
                    Start Now
                </button>
            </div>
        </div>
    );
};

export default Options;
