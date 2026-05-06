import React from 'react';
import { useNavigate } from 'react-router-dom';
import './banner.css';

const Banner = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/upload');  // Navigate to the upload page
  };

  return (
    <div>
      <div className="banner-background">
        <div className="banner-content">
          <div className="banner-text">
            <h1>Make it sound flawless</h1>
            <div className="banner-subtext">
              <p>Readily enhance audio quality online for free. Use advanced AI to
                filter out unwanted noise, translate across languages with voice cloning, isolate speaker and detect emotion of speech.</p>
            </div>
            <div className="bannerbtn" onClick={handleButtonClick}>
              <img src="/banner-btn-svg.jpg" className="button-image" />
              <span className="button-text">Enhance Audio Now</span>
            </div>
          </div>
          <div className="banner-video">
            <video className="video" autoPlay muted loop>
              <source src="/banner-video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
