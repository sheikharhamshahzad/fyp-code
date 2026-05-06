import React, { useState } from "react";
import "./faq.css";

const FAQ = () => {
  const [activeIndices, setActiveIndices] = useState([0]); // Open the first FAQ by default

  const toggleFAQ = (index) => {
    if (activeIndices.includes(index)) {
      // Remove index if it is already active
      setActiveIndices(activeIndices.filter((i) => i !== index));
    } else {
      // Add index to the list of active indices
      setActiveIndices([...activeIndices, index]);
    }
  };

  return (
    <div className="faq-container">
      <h1>FAQ about AI Voice Enhancer</h1>
      {faqData.map((item, index) => (
        <div className="faq-item" key={index}>
          <div
            className={`faq-question ${
              activeIndices.includes(index) ? "active" : ""
            }`}
            onClick={() => toggleFAQ(index)}
          >
            <div
              className={`icon ${
                activeIndices.includes(index) ? "active" : ""
              }`}
            >
              ?
            </div>
            <div className="text">{item.question}</div>
            <div
              className={`toggle ${
                activeIndices.includes(index) ? "active" : ""
              }`}
            >
              ▼
            </div>
          </div>
          <div
            className={`faq-answer ${
              activeIndices.includes(index) ? "active" : ""
            }`}
          >
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const faqData = [
  {
    question: "1. What is an Audio Enhancer?",
    answer:
      "This program uses AI and ML algorithms to enhance speech quality. It's trained to analyze millions of audio signals before reducing noise, enhancing volume, and making other adjustments to make audio clearer and more professional. These tools are revolutionizing how we listen to audio.",
  },
  {
    question: "2. How does it reduce noise?",
    answer: "This program uses AI and ML algorithms to enhance speech quality. It's trained to analyze millions of audio signals before reducing noise, enhancing volume, and making other adjustments to make audio clearer and more professional. These tools are revolutionizing how we listen to audio.",
  },
  {
    question: "3. Can it enhance music files?",
    answer: "This program uses AI and ML algorithms to enhance speech quality. It's trained to analyze millions of audio signals before reducing noise, enhancing volume, and making other adjustments to make audio clearer and more professional. These tools are revolutionizing how we listen to audio.",
  },
  {
    question: "4. Is it free to use?",
    answer: "This program uses AI and ML algorithms to enhance speech quality. It's trained to analyze millions of audio signals before reducing noise, enhancing volume, and making other adjustments to make audio clearer and more professional. These tools are revolutionizing how we listen to audio.",
  },
];

export default FAQ;
