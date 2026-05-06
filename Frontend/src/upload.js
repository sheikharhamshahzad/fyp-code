import React, { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { useNavigate } from "react-router-dom";
import "./upload.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from "axios";

const Upload = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [responseFile, setresponseFile] = useState(null);
    const [responseFileName, setresponseFileName] = useState("output.wav");
    const [isPreview, setIsPreview] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDenoisePlaying, setIsDenoisePlaying] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [targetLanguage, setTargetLanguage] = useState("");
    const [selectedSpeakers, setSelectedSpeakers] = useState([]); // Add new state for selected speakers
    const [showmerge, setshowmerge] = useState(false);
    const [responsespeakers, setresponsespeakers] = useState(null)
    // Add near other state declarations
    const [showTranslation, setShowTranslation] = useState(false);
    const [selectedSpeakerForTranslation, setSelectedSpeakerForTranslation] = useState(null);



    const waveSurferRef = useRef(null);
    const waveSurferDenoisedRef = useRef(null);
    const waveSurferSeparationRefs = useRef({});

    const navigate = useNavigate();
    const [resultComponent, setResultComponent] = useState(null);
    const [loading, setLoading] = useState(false); // Add loading state
    const [downloaddenoise, setdownloaddenoise] = useState(false);
    const [predict_emotion, setpredict_emotion] = useState(null);
    const [isSeparationPlaying, setIsSeparationPlaying] = useState([]);
    const [separationResponse, setSeparationResponse] = useState({ speakers: [] });

    const languageOptions = [
        "French",
        "Spanish",
        "English",
        "Chinese",
        "Russian",
        "Arabic",
        "Urdu"
    ];


    // First, create a new SpeakerSelector component at the top of your file
    const SpeakerSelector = ({ speakers, selectedSpeakers, onSpeakerSelect, onMerge }) => {
        return (
            <div className="merge-controls" style={{ marginTop: "60px" }}>
                <div className="merge-options" style={{
                    background: "#23263a",
                    borderRadius: "18px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                    padding: "12px 0px",
                    maxWidth: "420px",

                }}>
                    <h3 style={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1rem",
                        marginBottom: "18px",
                        letterSpacing: "0.5px"
                    }}>
                        Select speakers to merge:
                    </h3>
                    <div className="speaker-selection" style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "18px",
                        marginBottom: "26px",
                        justifyContent: "center"
                    }}>
                        {speakers?.map((speaker, index) => (
                            <label
                                key={index}
                                className={`speaker-checkbox-label${selectedSpeakers.includes(index) ? " checked" : ""}`}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    background: selectedSpeakers.includes(index) ? "#7C70FF" : "#181a2a",
                                    color: selectedSpeakers.includes(index) ? "#fff" : "#bfc7e0",
                                    borderRadius: "12px",
                                    padding: "8px 16px",
                                    cursor: "pointer",
                                    boxShadow: selectedSpeakers.includes(index)
                                        ? "0 2px 8px rgba(59,130,246,0.18)"
                                        : "0 1px 4px rgba(0,0,0,0.07)",
                                    border: selectedSpeakers.includes(index)
                                        ? "2px solid #60a5fa"
                                        : "2px solid transparent",
                                    transition: "all 0.18s"
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedSpeakers.includes(index)}
                                    onChange={() => onSpeakerSelect(index)}
                                    style={{
                                        accentColor: "#3b82f6",
                                        width: "16px",
                                        height: "16px",
                                        marginRight: "10px"
                                    }}
                                />
                                <i className="fas fa-user" style={{
                                    marginRight: "8px",
                                    fontSize: "1rem"
                                }}></i>
                                <span style={{
                                    fontWeight: 600,
                                    fontSize: "0.9rem"
                                }}>
                                    Speaker {index + 1}
                                </span>
                            </label>
                        ))}
                    </div>
                    <button
                        className={`merge-button${selectedSpeakers.length >= 2 ? " active" : " disabled"}`}
                        onClick={onMerge}
                        disabled={selectedSpeakers.length < 2}
                        style={{
                            width: "100%",
                            padding: "13px 0",
                            borderRadius: "10px",
                            background: selectedSpeakers.length >= 2 ? "#7C70FF" : "#23263a",
                            color: selectedSpeakers.length >= 2 ? "#fff" : "#bfc7e0",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            border: "none",
                            boxShadow: selectedSpeakers.length >= 2
                                ? "0 2px 12px rgba(59,130,246,0.13)"
                                : "none",
                            cursor: selectedSpeakers.length >= 2 ? "pointer" : "not-allowed",
                            transition: "all 0.18s"
                        }}
                    >
                        Merge Selected Speakers ({selectedSpeakers.length})
                    </button>
                </div>
            </div>
        );
    };


    // Add after SpeakerSelector component
    const TranslationSelector = ({
        speakers,
        selectedSpeaker,
        onSpeakerSelect,
        targetLanguage,
        onLanguageChange,
        onTranslate,
    }) => {
        return (
            <div className="translation-controls" style={{ marginTop: "60px" }}>
                <div
                    className="translation-options"
                    style={{
                        background: "#23263a",
                        borderRadius: "18px",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                        padding: "16px 0px",
                        maxWidth: "420px",
                    }}
                >
                    <div

                    >
                        <select
                            className="language-dropdown"
                            value={targetLanguage}
                            onChange={(e) => onLanguageChange(e.target.value)}

                        >
                            <option value="" disabled>
                                Select Language
                            </option>
                            {languageOptions.map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang}
                                </option>
                            ))}
                        </select>
                    </div>
                    <br></br>
                   

                    <div
                        className="speaker-translation"
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "18px",
                            marginBottom: "26px",
                            justifyContent: "center",
                        }}
                    >
                        {speakers?.map((speaker, index) => (
                            <label
                                key={index}
                                className={`speaker-radio-label${selectedSpeaker === index ? " checked" : ""
                                    }`}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    background:
                                        selectedSpeaker === index ? "#7C70FF" : "#181a2a",
                                    color:
                                        selectedSpeaker === index ? "#fff" : "#bfc7e0",
                                    borderRadius: "12px",
                                    padding: "8px 16px",
                                    cursor: "pointer",
                                    boxShadow:
                                        selectedSpeaker === index
                                            ? "0 2px 8px rgba(59,130,246,0.18)"
                                            : "0 1px 4px rgba(0,0,0,0.07)",
                                    border:
                                        selectedSpeaker === index
                                            ? "2px solid #60a5fa"
                                            : "2px solid transparent",
                                    transition: "all 0.18s",
                                }}
                            >
                                <input
                                    type="radio"
                                    id={`speaker-${index}`}
                                    name="speaker"
                                    checked={selectedSpeaker === index}
                                    onChange={() => onSpeakerSelect(index)}
                                    style={{
                                        accentColor: "#3b82f6",
                                        width: "16px",
                                        height: "16px",
                                        marginRight: "10px",
                                    }}
                                />
                                <i
                                    className="fas fa-user"
                                    style={{ marginRight: "8px", fontSize: "1rem" }}
                                ></i>
                                <span
                                    style={{ fontWeight: 600, fontSize: "0.9rem" }}
                                >
                                    Speaker {index + 1}
                                </span>
                            </label>
                        ))}
                    </div>



                    <button
                        className={`translate-button${selectedSpeaker !== null && targetLanguage ? " active" : " disabled"
                            }`}
                        onClick={onTranslate}
                        disabled={selectedSpeaker === null || !targetLanguage}
                        style={{
                            width: "80%",
                            padding: "13px 0",
                            borderRadius: "10px",
                            background:
                                selectedSpeaker !== null && targetLanguage
                                    ? "#7C70FF"
                                    : "#23263a",
                            color:
                                selectedSpeaker !== null && targetLanguage
                                    ? "#fff"
                                    : "#bfc7e0",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            border: "none",
                            boxShadow:
                                selectedSpeaker !== null && targetLanguage
                                    ? "0 2px 12px rgba(59,130,246,0.13)"
                                    : "none",
                            cursor:
                                selectedSpeaker !== null && targetLanguage
                                    ? "pointer"
                                    : "not-allowed",
                            transition: "all 0.18s",
                        }}
                    >
                        Translate Speaker {selectedSpeaker !== null ? selectedSpeaker + 1 : ""}
                    </button>
                </div>
            </div>
        );
    };


    const handleSpeakerTranslate = async () => {
        if (selectedSpeakerForTranslation === null || !targetLanguage) {
            alert("Please select both a speaker and target language");
            return;
        }

        setLoading(true);
        setResultComponent(
            <div className="loading-container">
                <p>Translating speaker {selectedSpeakerForTranslation + 1}...</p>
                <div className="spinner"></div>
            </div>
        );

        try {
            const speaker = separationResponse.speakers[selectedSpeakerForTranslation];
            const speakerBlob = await fetch(`http://localhost:8000/download/${speaker.file_url.split('/').pop()}`).then(r => r.blob());

            const formData = new FormData();
            formData.append("file", speakerBlob);
            formData.append("target_language", targetLanguage);

            const response = await axios.post("http://localhost:8000/translate_with_voice_retention/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(blob);
            setresponseFile(audioUrl);

            setResultComponent(
                <div className="result-denoise">
                    <div className="preview-denoise-items">
                        <button
                            className={`play-button-denoise ${isDenoisePlaying ? "playing" : ""}`}
                            onClick={toggleDenoisePlay}
                        >
                            <span className={`play-icon-denoise ${isDenoisePlaying ? "pause-icon-denoise" : ""}`}></span>
                        </button>
                        <div id="waveform-denoise" className="waveform-denoise-container"></div>
                    </div>
                </div>
            );
            setdownloaddenoise(true);

        } catch (error) {
            console.error("Translation failed:", error);
            setResultComponent(<p>Error during translation. Please try again.</p>);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile && (uploadedFile.type === "audio/wav")) {
            setFile(uploadedFile);
            setFileName(uploadedFile.name);
            setIsPreview(true);
        } else {
            alert("Please upload a valid WAV file.");
            setFile(null);
            setFileName("");
        }
    };



    const resetState = () => {
        // Clean up main waveform
        if (waveSurferRef.current) {
            waveSurferRef.current.destroy();
            waveSurferRef.current = null;
        }

        // Clean up denoised waveform
        if (waveSurferDenoisedRef.current) {
            waveSurferDenoisedRef.current.destroy();
            waveSurferDenoisedRef.current = null;
        }

        // Clean up separation waveforms
        if (waveSurferSeparationRefs.current) {
            Object.values(waveSurferSeparationRefs.current).forEach(ws => {
                if (ws) {
                    ws.destroy();
                }
            });
            waveSurferSeparationRefs.current = {};
        }

        // Clean up audio elements
        document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
            audio.src = '';
            audio.load();
        });

        // Reset all states
        setFile(null);
        setFileName("");
        setresponseFile(null);
        setresponseFileName("output.wav");
        setIsPreview(false);
        setIsPlaying(false);
        setIsDenoisePlaying(false);
        setShowOptions(false);
        setSelectedOption(null);
        setTargetLanguage("");
        setResultComponent(null);
        setLoading(false);
        setdownloaddenoise(false);
        setshowmerge(false);
        setShowTranslation(false);
        setresponsespeakers(null);
        setpredict_emotion(null);
        setIsSeparationPlaying([]);
        setSeparationResponse({ speakers: [] });
        setSelectedSpeakers([]); // Reset selected speakers
    };

    const handleDenoise = async () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        setResultComponent(
            <div className="loading-container">
                <p>Processing your audio...</p>
                <div className="spinner"></div>
            </div>
        );

        try {
            const response = await axios.post("http://localhost:8000/denoise/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "blob", // This ensures the response is treated as a file
            });

            // Create a URL for the received audio file
            const blob = new Blob([response.data], { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(blob);
            setresponseFile(audioUrl);

            // Now update the UI with the new response
            setResultComponent(
                <div className="result-denoise">
                    <div className="preview-denoise-items">
                        <button
                            className={`play-button-denoise ${isDenoisePlaying ? "playing" : ""}`}
                            onClick={toggleDenoisePlay}
                        >
                            <span className={`play-icon-denoise ${isDenoisePlaying ? "pause-icon-denoise" : ""}`}></span>
                        </button>
                        <div id="waveform-denoise" className="waveform-denoise-container"></div>
                    </div>
                </div>
            );
            setdownloaddenoise(true);

        } catch (error) {
            console.error("Error uploading file:", error);
            setResultComponent(<p>Error processing audio. Please try again.</p>);
        } finally {
            setLoading(false); // Stop loading

        }
    };

    function getEmoji(emotion) {
        const emotionMap = {
            happy: String.fromCodePoint(0x1F604),    // 😄
            sad: String.fromCodePoint(0x1F622),      // 😢
            angry: String.fromCodePoint(0x1F620),    // 😠
            fear: String.fromCodePoint(0x1F628),     // 😨
            disgust: String.fromCodePoint(0x1F92E),  // 🤮
            neutral: String.fromCodePoint(0x1F610),  // 😐
            joy: String.fromCodePoint(0x1F60A),      // 😊
            surprise: String.fromCodePoint(0x1F62E),  // 😮
            sadness: String.fromCodePoint(0x1F622),      // 😢
        };

        return emotionMap[emotion.toLowerCase()] || "❓";
    }

    const handleSentiment = async () => {
        setdownloaddenoise(false);
        if (!file) {
            alert("Please select a file first!");
            return;
        }


        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        setResultComponent(
            <div className="loading-container">
                <p>Processing your audio...</p>
                <div className="spinner"></div>
            </div>
        );


        try {
            const response = await axios.post("http://localhost:8000/predict_emotion/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "json", // This ensures the response is treated as a file
            });

            setpredict_emotion(response.data.emotion);

            let emotionString = response.data.emotion; // could be "happy" or "happy or joy"

            let message = "";
            let primaryEmotion = "";
            let emoji = "";
            if (emotionString === 'HAPPY OR JOY')
                emotionString = 'HAPPY';
            if (emotionString === 'SAD OR SADNESS')
                emotionString = 'SAD';
            // Check if it's a combined emotion
            if (emotionString.includes(" OR ")) {
                const [voiceEmotion, textEmotion] = emotionString.split(" OR ").map(e => e.trim().toUpperCase());
                primaryEmotion = voiceEmotion;
                emoji = getEmoji(textEmotion);
                message = `It sounds like ${voiceEmotion}, and the context feels like ${textEmotion}.`;
            } else {
                primaryEmotion = emotionString;
                emoji = getEmoji(primaryEmotion);
                message = `Emotion detected is ${primaryEmotion} — conveyed through both sound and context.`;
            }

            setResultComponent(
                <>
                    <div className="emotions-result" style={{ fontSize: "34px" }}>
                        {emoji}
                        <br />
                    </div>
                    <div className="emotions-text">
                        <p>{message}</p>
                    </div>
                </>
            );


        } catch (error) {
            console.error("Error uploading file:", error);
            setResultComponent(<p>Error processing audio. Please try again.</p>);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleIsolateSpeaker = async () => {
        setdownloaddenoise(false);
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        setResultComponent(
            <div className="loading-container">
                <p>Processing your audio...</p>
                <div className="spinner"></div>
            </div>
        );

        try {
            const response = await axios.post("http://localhost:8000/separate_speakers/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (Array.isArray(response.data.speakers)) {
                setSeparationResponse(response.data);
                setIsSeparationPlaying(new Array(response.data.speakers.length).fill(false));
            } else {
                setSeparationResponse(null);
                setIsSeparationPlaying([]); // Prevent iterable error
            }

            setResultComponent(
                <div className="result-separation">
                    {/* Audio waveforms section */}
                    <div className="speakers-waveforms">
                        {response.data.speakers?.map((speaker, index) => (
                            <div key={index} className="preview-separation-items">
                                <div className="speaker-label">SP_ {index + 1}</div>
                                <button
                                    className={`play-button-separation ${isSeparationPlaying[index] ? "playing" : ""}`}
                                    onClick={() => toggleSeparationPlay(index)}
                                >
                                    <span className={`play-icon-separation ${isSeparationPlaying[index] ? "pause-icon-separation" : ""}`}></span>
                                </button>
                                <div id={`waveform-separation-${index}`} className="waveform-separation-container"></div>
                            </div>
                        ))}
                    </div>
                </div>
            );
            setshowmerge(true)
            setresponsespeakers(response.data.speakers)

        } catch (error) {
            console.error("Error uploading file:", error);
            setResultComponent(<p>Error processing audio. Please try again.</p>);
        } finally {
            setLoading(false);
        }
    };




    const handleTranslateWithVoiceRetention = async () => {
        if (!file || !targetLanguage) {
            alert("Please select a WAV file and enter a target language.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("target_language", targetLanguage);

        setLoading(true);
        setResultComponent(
            <div className="loading-container">
                <p>Translating and cloning voice...</p>
                <div className="spinner"></div>
            </div>
        );

        try {
            const response = await axios.post("http://localhost:8000/translate_with_voice_retention/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(blob);
            setresponseFile(audioUrl);

            // Update the result component to include a container for WaveSurfer
            setResultComponent(
                <div className="result-denoise">
                    <div className="preview-denoise-items">
                        <button
                            className={`play-button-denoise ${isDenoisePlaying ? "playing" : ""}`}
                            onClick={toggleDenoisePlay}
                        >
                            <span className={`play-icon-denoise ${isDenoisePlaying ? "pause-icon-denoise" : ""}`}></span>
                        </button>
                        <div id="waveform-denoise" className="waveform-denoise-container"></div>
                    </div>
                </div>
            );
            setdownloaddenoise(true);

        } catch (error) {
            console.error("Translation failed:", error);
            setResultComponent(<p>Error during translation. Please try again.</p>);
        } finally {
            setLoading(false);
        }
    };



    const handleMagic = async () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        setLoading(true);
        setdownloaddenoise(false);

        // Step 1: Denoise Audio
        setResultComponent(
            <div className="loading-container">
                <p>Step 1: Denoising audio...</p>
                <div className="spinner"></div>
            </div>
        );

        try {
            // Denoise Process
            const formData = new FormData();
            formData.append("file", file);
            const denoiseResponse = await axios.post("http://localhost:8000/denoise/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "blob",
            });

            // Step 2: Speaker Separation
            setResultComponent(
                <div className="loading-container">
                    <p>Step 2: Separating speakers...</p>
                    <div className="spinner"></div>
                </div>
            );

            // Create new FormData with denoised audio
            const denoisedFormData = new FormData();
            denoisedFormData.append("file", new Blob([denoiseResponse.data], { type: "audio/wav" }));

            const separationResponse = await axios.post("http://localhost:8000/separate_speakers/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (Array.isArray(separationResponse.data.speakers)) {
                setSeparationResponse(separationResponse.data);
                setIsSeparationPlaying(new Array(separationResponse.data.speakers.length).fill(false));
                setresponsespeakers(separationResponse.data.speakers);
                setShowTranslation(true);

                // Step 3: Emotion Detection for each speaker
                const emotionResults = [];

                setResultComponent(
                    <div className="magic-results">
                        <div className="result-separation">
                            <div className="speakers-waveforms" >
                                {separationResponse.data.speakers?.map((speaker, index) => (
                                    <div key={index} className="preview-separation-items">
                                        <div className="speaker-label">SP_ {index + 1}</div>
                                        <button
                                            className={`play-button-separation ${isSeparationPlaying[index] ? "playing" : ""}`}
                                            onClick={() => toggleSeparationPlay(index)}
                                        >
                                            <span className={`play-icon-separation ${isSeparationPlaying[index] ? "pause-icon-separation" : ""}`}></span>
                                        </button>
                                        <div id={`waveform-separation-${index}`} className="waveform-separation-container"></div>
                                        <div id={`emotion-result-${index}`} className="emotion-container">
                                            <p>Analyzing emotions...</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

                // Process emotion detection for each speaker
                for (let i = 0; i < separationResponse.data.speakers.length; i++) {
                    const speaker = separationResponse.data.speakers[i];
                    const speakerBlob = await fetch(`http://localhost:8000/download/${speaker.file_url.split('/').pop()}`).then(r => r.blob());
                    const emotionFormData = new FormData();
                    emotionFormData.append("file", speakerBlob);

                    try {
                        const emotionResponse = await axios.post("http://localhost:8000/predict_emotion/", emotionFormData, {
                            headers: { "Content-Type": "multipart/form-data" },
                            responseType: "json",
                        });

                        const emotionString = emotionResponse.data.emotion;
                        let message = "";
                        let emoji = "";

                        if (emotionString.includes(" OR ")) {
                            const [voiceEmotion, textEmotion] = emotionString.split(" OR ").map(e => e.trim().toUpperCase());
                            emoji = getEmoji(textEmotion);
                            
                        } else {
                            emoji = getEmoji(emotionString);
                            
                        }

                        emotionResults[i] = { emoji, message };

                        // Update the emotion container for this speaker
                        const emotionContainer = document.getElementById(`emotion-result-${i}`);
                        if (emotionContainer) {
                            emotionContainer.innerHTML = `
                            <div class="emotion-result">
                                <div class="emotion-emoji">${emoji}</div>
                                <div class="emotion-message">${message}</div>
                            </div>
                        `;
                        }
                    } catch (error) {
                        console.error(`Error detecting emotion for speaker ${i + 1}:`, error);
                        const emotionContainer = document.getElementById(`emotion-result-${i}`);
                        if (emotionContainer) {
                            emotionContainer.innerHTML = `<p>Error detecting emotion</p>`;
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error in magic process:", error);
            setResultComponent(<p>Error processing audio. Please try again.</p>);
        } finally {
            setLoading(false);
        }
    };


    const handleStartClick = () => {
        if (selectedOption) {
            switch (selectedOption) {
                case "Sonify Magic":
                    // setResultComponent(
                    //     <div className="result-sonify">
                    //         <h2>Applying Advanced AI Denoising</h2>
                    //         <br></br>
                    //         <br></br>

                    //         <h2>Speaker Isolation and Emotion Detection</h2>
                    //         <br></br>

                    //         <div className="isolate-container">
                    //             {/* Speaker 1 */}
                    //             <div className="icon-slider-container">
                    //                 <div className="speaker">

                    //                     <i className="fas fa-user icon"></i>
                    //                     <p>Speaker 1 (Male)</p>

                    //                 </div>

                    //                 <input type="range" min="0" max="100" className="volume-slider" />
                    //             </div>

                    //             {/* Speaker 2 */}
                    //             <div className="icon-slider-container">
                    //                 <div className="speaker">

                    //                     <i className="fas fa-user icon"></i>
                    //                     <p>Speaker 2 (Male)</p>

                    //                 </div>

                    //                 <input type="range" min="0" max="100" className="volume-slider" />
                    //             </div>

                    //             {/* Speaker 3 */}
                    //             <div className="icon-slider-container">
                    //                 <div className="speaker">

                    //                     <i className="fas fa-user icon"></i>
                    //                     <p>Speaker 3 (Female)</p>

                    //                 </div>

                    //                 <input type="range" min="0" max="100" className="volume-slider" />
                    //             </div>
                    //         </div>

                    //         <br></br>
                    //         <br></br>

                    //         <h2>Translate with Voice Retention</h2>






                    // </div>

                    // );
                    handleMagic();
                    break;

                case "Denoise":
                    handleDenoise();
                    break;
                case "Translate with Voice Retention":
                    handleTranslateWithVoiceRetention();
                    break;
                case "Sentiment Analysis":
                    handleSentiment();
                    break;
                case "Isolate Speaker":
                    handleIsolateSpeaker();
                    break;
                default:
                    setResultComponent(<p>Processing your selected option...</p>);
            }
        } else {
            alert("Please select a feature type before proceeding.");
        }
    };

    useEffect(() => {
        if ((isPreview || showOptions) && file) {
            const audioUrl = URL.createObjectURL(file);

            if (!waveSurferRef.current) {
                waveSurferRef.current = WaveSurfer.create({
                    container: "#waveform",
                    waveColor: "#bbb",
                    progressColor: "#ffffff",
                    barWidth: 1,
                    cursorColor: "#ffffff",
                    height: 60,
                    responsive: true,
                });
            }

            waveSurferRef.current.load(audioUrl);

            return () => {
                if (waveSurferRef.current) {
                    waveSurferRef.current.destroy();
                    waveSurferRef.current = null;
                }
            };
        }
    }, [isPreview, showOptions, file]);

    useEffect(() => {
        if (responseFile) {
            if (!waveSurferDenoisedRef.current) {
                waveSurferDenoisedRef.current = WaveSurfer.create({
                    container: "#waveform-denoise",
                    waveColor: "#bbb",
                    progressColor: "#ffffff",
                    barWidth: 1,
                    cursorColor: "#ffffff",
                    height: 60,
                    responsive: true,
                });
            }

            waveSurferDenoisedRef.current.load(responseFile);

            return () => {
                if (waveSurferDenoisedRef.current) {
                    waveSurferDenoisedRef.current.destroy();
                    waveSurferDenoisedRef.current = null;
                }
            };
        }
    }, [responseFile]);


    useEffect(() => {
        if (separationResponse?.speakers && Array.isArray(separationResponse.speakers)) {
            separationResponse.speakers.forEach((speaker, index) => {
                const containerId = `#waveform-separation-${index}`;

                // Ensure waveSurferSeparationRefs.current exists
                if (!waveSurferSeparationRefs.current) {
                    waveSurferSeparationRefs.current = {};
                }

                if (!waveSurferSeparationRefs.current[index]) {
                    waveSurferSeparationRefs.current[index] = WaveSurfer.create({
                        container: containerId,
                        waveColor: "#bbb",
                        progressColor: "#ffffff",
                        barWidth: 1,
                        cursorColor: "#ffffff",
                        height: 60,
                        responsive: true,
                    });

                    waveSurferSeparationRefs.current[index].load(
                        `http://localhost:8000/download/${speaker?.file_url?.split('/').pop() || ""}`
                    );
                }
            });

            // Cleanup function
            return () => {
                if (waveSurferSeparationRefs.current) {
                    Object.keys(waveSurferSeparationRefs.current).forEach((key) => {
                        if (waveSurferSeparationRefs.current[key]) {
                            waveSurferSeparationRefs.current[key].destroy();
                            delete waveSurferSeparationRefs.current[key];
                        }
                    });
                }
            };
        }
    }, [separationResponse]);




    const togglePlay = () => {
        if (waveSurferRef.current) {
            if (waveSurferRef.current.isPlaying()) {
                waveSurferRef.current.pause();
                setIsPlaying(false);
            } else {
                waveSurferRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const toggleDenoisePlay = () => {
        if (waveSurferDenoisedRef.current) {
            if (waveSurferDenoisedRef.current.isPlaying()) {
                waveSurferDenoisedRef.current.pause();
                setIsDenoisePlaying(false); // Ensure immediate state update
            } else {
                waveSurferDenoisedRef.current.play();
                setIsDenoisePlaying(true); // Ensure immediate state update
            }
        }
    };

    const toggleSeparationPlay = (index) => {
        const waveSurfer = waveSurferSeparationRefs.current[index];

        if (!waveSurfer) return;

        setIsSeparationPlaying((prev) => {
            const updatedState = [...prev];

            if (updatedState[index]) {
                // If already playing, pause it
                waveSurfer.pause();
                updatedState[index] = false;
            } else {
                // Pause all other waveforms first
                Object.values(waveSurferSeparationRefs.current).forEach((ws) => {
                    if (ws) ws.pause();
                });

                // Reset to start if at end of track
                if (waveSurfer.getCurrentTime() >= waveSurfer.getDuration()) {
                    waveSurfer.seekTo(0);
                }

                // Small timeout to ensure pause operations complete
                setTimeout(() => {
                    waveSurfer.play();
                }, 50);

                updatedState.fill(false); // Stop all other speakers
                updatedState[index] = true;
            }

            return updatedState;
        });
    };

    const handleSpeakerSelect = (index) => {
        setSelectedSpeakers(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    const handleMerge = async () => {
        if (selectedSpeakers.length < 2) return;

        setLoading(true);
        setResultComponent(
            <div className="loading-container">
                <p>Merging selected audio files...</p>
                <div className="spinner"></div>
            </div>
        );

        try {
            const formData = new FormData();
            // Create an array of promises for fetching files
            const fetchPromises = selectedSpeakers.map(async (speakerIndex) => {
                const speaker = separationResponse.speakers[speakerIndex];
                const fileUrl = `http://localhost:8000/download/${speaker.file_url.split('/').pop()}`;
                const response = await fetch(fileUrl);
                const blob = await response.blob();
                return blob;
            });

            // Wait for all files to be fetched
            const audioBlobs = await Promise.all(fetchPromises);

            // Append each blob to formData with unique names
            audioBlobs.forEach((blob, index) => {
                formData.append('files', blob, `speaker_${index}.wav`);
            });

            const response = await axios.post("http://localhost:8000/merge_audio/", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(blob);
            setresponseFile(audioUrl);

            setResultComponent(
                <div className="result-denoise">
                    <div className="preview-denoise-items">
                        <button
                            className={`play-button-denoise ${isDenoisePlaying ? "playing" : ""}`}
                            onClick={toggleDenoisePlay}
                        >
                            <span className={`play-icon-denoise ${isDenoisePlaying ? "pause-icon-denoise" : ""}`}></span>
                        </button>
                        <div id="waveform-denoise" className="waveform-denoise-container"></div>
                    </div>
                </div>
            );
            setdownloaddenoise(true);

        } catch (error) {
            console.error("Merge failed:", error);
            setResultComponent(<p>Error merging audio files. Please try again.</p>);
        } finally {
            setLoading(false);
        }
    };

    const handleEnhanceClick = () => {
        setShowOptions(true);
    };

    const handleOptionClick = (option) => {
        setSelectedOption(option);
    };



    if (showOptions) {
        return (
            <div className="main-options-container">
                <div class="options-top">
                    <header className="upload-header3">
                        <img src="/logo.png" alt="Logo" className="upload-logo2" />
                        <span className="upload-logo-text3">Sonify</span>
                    </header>
                    <h1 className="options-title">AI Audio Enhancer</h1>
                </div>

                <div className="options-container">                <div className="options-main-card">
                    <div class="select-option-text">
                        <p>Select Option</p>
                    </div>

                    <div className="options-main-card2">
                        <div class="leftside-container">
                            <div className="options-main-card-left">
                                {[
                                    "Sonify Magic",
                                    "Denoise",
                                    "Isolate Speaker",
                                    "Sentiment Analysis",
                                    "Translate with Voice Retention",
                                ].map((option, index) => (
                                    <div
                                        key={index}
                                        className={`options-cards ${selectedOption === option ? "active" : ""}`}
                                        onClick={() => handleOptionClick(option)}
                                    >
                                        <span>{option}</span>
                                        <button className="play-btn"></button>
                                    </div>
                                ))}
                            </div>
                            {selectedOption === "Translate with Voice Retention" && ( // Only show dropdown if target language is NOT selected
                                <div className="language-select-wrapper">
                                    <select
                                        className="language-dropdown"
                                        value={targetLanguage}
                                        onChange={(e) => setTargetLanguage(e.target.value)}
                                    >
                                        <option value="" disabled>Select Language</option>
                                        {languageOptions.map((lang) => (
                                            <option key={lang} value={lang}>
                                                {lang}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <button
                                className={`options-button active ${selectedOption ? "" : "disabled"}`}
                                onClick={handleStartClick}
                            >
                                Start Now
                            </button>
                            {showmerge && (
                                <SpeakerSelector
                                    speakers={responsespeakers}
                                    selectedSpeakers={selectedSpeakers}
                                    onSpeakerSelect={handleSpeakerSelect}
                                    onMerge={handleMerge}
                                />
                            )}
                            {showTranslation && (
                                <TranslationSelector
                                    speakers={responsespeakers}
                                    selectedSpeaker={selectedSpeakerForTranslation}
                                    onSpeakerSelect={setSelectedSpeakerForTranslation}
                                    targetLanguage={targetLanguage}
                                    onLanguageChange={setTargetLanguage}
                                    onTranslate={handleSpeakerTranslate}
                                />
                            )}

                        </div>

                        <div className="options-main-card-right">
                            <div className="preview-box2">
                                <div className="preview-items2">
                                    <div className="preview-items2-left">
                                        {fileName && <p className="audio-file-name">{fileName}</p>}
                                    </div>
                                    <div className="preview-items2-right">
                                        <button className="upload-icon2" onClick={resetState}>
                                            Upload New
                                        </button>
                                        <button className="delete-icon4" onClick={resetState}>
                                            <i className="fas fa-trash"></i>
                                        </button>

                                    </div>
                                </div>
                                <div className="preview-items">
                                    <button
                                        className={`play-button ${isPlaying ? "playing" : ""}`}
                                        onClick={togglePlay}
                                    >
                                        <span className={`play-icon ${isPlaying ? "pause-icon" : ""}`}></span>
                                    </button>
                                    <div id="waveform" className="waveform-container"></div>
                                </div>
                            </div>
                            <div class="result-heading">
                                <p>Result Preview</p>
                            </div>
                            <div className="result-box">
                                {resultComponent || <p>Please select a feature type and then click start now</p>}
                            </div>


                            <div class="download-main-card">
                                {downloaddenoise && <button className="download-button active" onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = responseFile;
                                    link.download = responseFileName;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}>Download</button>}
                            </div>

                        </div>

                    </div>
                </div>
                </div>
            </div>
        );
    }

    if (isPreview) {
        return (
            <div className="preview-container">
                <header className="upload-header2">
                    <img src="/logo.png" alt="Logo" className="upload-logo2" />
                    <span className="upload-logo-text2">Sonify</span>
                </header>
                <h1 className="upload-title">AI Audio Enhancer</h1>
                <p className="upload-subtitle">Preview your audio</p>
                <div className="preview-box">
                    <div className="preview-items2">
                        <div className="preview-items2-left">
                            {fileName && <p className="audio-file-name">{fileName}</p>}
                        </div>
                        <div className="preview-items2-right">
                            <button className="upload-icon2" onClick={resetState}>
                                Upload New
                            </button>
                            <button className="delete-icon4" onClick={resetState}>
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div className="preview-items">
                        <button
                            className={`play-button ${isPlaying ? "playing" : ""}`}
                            onClick={togglePlay}
                        >
                            <span className={`play-icon ${isPlaying ? "pause-icon" : ""}`}></span>
                        </button>
                        <div id="waveform" className="waveform-container"></div>
                    </div>
                </div>
                <button className="upload-button active" onClick={handleEnhanceClick}>
                    Start Enhancing Now
                </button>
                <p className="upload-footer">
                    By uploading an audio or video you agree to our <a href="#">Terms of Service</a>
                </p>
            </div>
        );
    }

    return (
        <div className="upload-container">
            <header className="upload-header">
                <img src="/logo.png" alt="Logo" className="upload-logo" />
                <span className="upload-logo-text">Sonify</span>
            </header>
            <h1 className="upload-title">AI Audio Enhancer</h1>
            <p className="upload-subtitle">Upload audio</p>

            <div className="upload-box">
                <label htmlFor="file-input" className="upload-area">
                    <img src="/upload-icon.png" alt="Upload Icon" className="upload-icon" />
                    <p className="upload-text">Upload</p>
                    <input
                        type="file"
                        id="file-input"
                        accept=".mp3, .wav"
                        onChange={handleFileChange}
                        hidden
                    />
                </label>
            </div>
            <p className="upload-footer">
                By uploading an audio or video you agree to our <a href="#">Terms of Service</a>
            </p>
        </div>
    );
};

export default Upload;
