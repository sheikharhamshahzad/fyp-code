import React from 'react';
import './footer.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Logo Section */}
                <div className="footer-section logo-section">
                    <div class="logosection-content">
                        <img src="/logo.png" alt="Sonify Logo" className="footer-logo-img" />
                        <h2 className="footer-logo">Sonify</h2>
                        <div className="footer-socials">
                            <a href="#" className="social-link">
                                <i className="fab fa-facebook"></i>
                            </a>
                            <a href="#" className="social-link">
                                <i className="fab fa-youtube"></i>
                            </a>
                            <a href="#" className="social-link">
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="#" className="social-link">
                                <i className="fab fa-tiktok"></i>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Vertical Line */}
                <div className="footer-divider"></div>

                {/* Popular Features Section */}
                
                <div className="footer-section">
                    <h3>Popular Features</h3>
                    <ul>
                        <li><a href="#">Noise Reduction</a></li>
                        <li><a href="#">Volume Adjustment</a></li>
                        <li><a href="#">Speaker Isolation</a></li>
                        <li><a href="#">Selective Translation</a></li>
                        <li><a href="#">Sentiment Analysis</a></li>
                        <li><a href="#">Speaker Matching</a></li>
                    </ul>
                </div>

                {/* Policies Section */}
                <div className="footer-section">
                    <h3>Policies</h3>
                    <ul>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Use</a></li>
                    </ul>
                </div>

                {/* Contact Section */}
                <div className="footer-section">
                    <h3>Contact</h3>
                    <ul>
                        <li><a href="#">Feedback</a></li>
                        <li><a href="#">Contact Us</a></li>
                    </ul>
                </div>
            </div>

            {/* Footer Bottom Section */}
            <div className="footer-bottom">
                <p>© 2025, Sonify. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
