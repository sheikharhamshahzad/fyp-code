import React from 'react';
import { useNavigate } from 'react-router-dom';
import './features.css';

const Features = () => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/upload');
    };

    return (
        <div className="features-container">
            <div className="content-wrapper">
                <div className="features-headingg">
                    <h1>Standout Features of Sonify AI Audio Enhancer</h1>
                </div>

                <div className="cards">
                    <div className="leftcards">
                        <div className="card">
                            <h2>Noise Reduction</h2>
                            <p>Clean the audio by reducing background noise</p>
                            <button onClick={handleNavigate}>Reduce Now</button>
                        </div>

                        <div className="card">
                            <h2>Volume Adjustment</h2>
                            <p>Adjust the volume of individual speakers particularly when one speaker’s voice is very low</p>
                            <button onClick={handleNavigate}>Adjust Now</button>
                        </div>

                        <div className="card">
                            <h2>Speaker Isolation</h2>
                            <p>Remove all speakers except one, allowing the user to focus on a specific speaker. Mute other speakers in the conversation</p>
                            <button onClick={handleNavigate}>Isolate Now</button>
                        </div>
                    </div>

                    <div className="rightcards">
                        <div className="card">
                            <h2>Selective Translation</h2>
                            <p>Translate specific speakers to different languages while maintaining their original voice characteristics</p>
                            <button onClick={handleNavigate}>Translate Now</button>
                        </div>

                        <div className="card">
                            <h2>Sentiment Analysis</h2>
                            <p>Analyze the sentiment or emotional tone of the speakers, providing feedback on the mood of the conversation</p>
                            <button onClick={handleNavigate}>Analyze Now</button>
                        </div>

                        <div className="card">
                            <h2>Sonify Magic</h2>
                            <p>All in one solution for your audio file. Use all features of Sonify together to enhance your audio to the next level</p>
                            <button onClick={handleNavigate}>Sonify Now</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Features;
