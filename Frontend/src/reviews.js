import React, { useState, useEffect } from "react";
import "./reviews.css";

const reviewsData = [
  {
    text: "Sonify is an intuitive tool that exceeded my expectations. Without needing any technical know-how, I was able to enhance my audio in minutes. Just upload your file and let the magic happen—simple and effective!",
    author: "Zamin Jaffri",
    rating: 4.5,
  },
  {
    text: "I’ve tried many audio processing tools, but Sonify stands out for its simplicity and efficiency. No complex settings or tutorials needed—just upload your audio and get top-notch results instantly.",
    author: "Arham Shahzad",
    rating: 4.5,
  },
  {
    text: "Sonify makes audio enhancement incredibly easy. I didn't have to dive into any complicated instructions—just a quick upload, and my audio was instantly clear and crisp. Perfect for anyone looking for hassle-free audio improvement!",
    author: "Hassan Jaffar",
    rating: 5,
  },
  {
    text: "As someone new to audio editing, Sonify was a game-changer. The process was straightforward: upload your audio, and the tool does the rest. The clarity and quality of the output were impressive!",
    author: "Mubashar Hussian",
    rating: 4,
  },
  {
    text: "Sonify is the perfect solution for anyone looking to enhance their audio without any technical knowledge. The user-friendly interface makes it as simple as uploading your file and enjoying the enhanced quality immediately.",
    author: "Abdul Hannan",
    rating: 4.5,
  },
];

const Reviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviewsData.length);
    }, 3000); // Change review every 3 seconds

    return () => clearInterval(interval);
  }, [reviewsData.length]); // Ensure that the effect re-runs when reviewsData length changes

  const { text, author, rating } = reviewsData[currentIndex];

  return (
    <div className="review-container">
      <div className="review-content">
        <div className="review-rating">
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={`star ${
                index < Math.floor(rating) || (rating - index > 0 && rating % 1 !== 0)
                  ? "filled"
                  : ""
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <p className="review-text">"{text}"</p>
        <div className="review-author">{author}</div>
      </div>
      <div className="dots">
        {reviewsData.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
