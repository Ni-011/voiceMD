"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      let recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript((prev) => prev + finalTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        showNotification("Error occurred during speech recognition.", "error");
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
      recognitionRef.current = recognition;
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  }, []);

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
      showNotification("Recording started", "info");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      showNotification("Recording stopped", "info");
    }
  };

  const sendRecording = async (
    endpoint: string,
    body: any,
    destination: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      showNotification(`Successfully sent to ${destination}`, "success");
    } catch (error) {
      showNotification(`Failed to send to ${destination}`, "error");
    } finally {
      setIsLoading(false);
      stopRecording();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-5">
      <div className="w-full max-w-2xl p-8 bg-gray-800 bg-opacity-70 rounded-xl shadow-2xl backdrop-blur-lg border border-gray-700">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Medical Voice Notes
          </h1>
          <p className="mt-2 text-gray-400">
            Transcribe and save voice notes efficiently
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center px-4 py-2 rounded-full bg-gray-900 shadow-inner border border-gray-700">
            <span
              className={`h-3 w-3 rounded-full mr-2 ${
                isRecording ? "bg-red-500 animate-pulse" : "bg-gray-600"
              }`}
            ></span>
            <span className="text-sm font-medium text-gray-300">
              {isRecording ? "Recording in progress..." : "Ready to record"}
            </span>
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-all hover:cursor-pointer duration-300 flex items-center justify-center w-36 ${
              isRecording
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-lg"
            }`}
            onClick={startRecording}
            disabled={isRecording}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
            Start
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium hover:cursor-pointer transition-all duration-300 flex items-center justify-center w-36 ${
              !isRecording
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-lg"
            }`}
            onClick={stopRecording}
            disabled={!isRecording}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                clipRule="evenodd"
              />
            </svg>
            Stop
          </button>
        </div>

        {/* Transcript Display */}
        <div className="mb-8">
          <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            Transcript
          </h2>
          <div className="bg-gray-900 rounded-lg p-4 shadow-inner min-h-32 max-h-60 overflow-y-auto border border-gray-700">
            <p className="font-mono text-gray-300 whitespace-pre-wrap">
              {transcript || "Your transcribed text will appear here..."}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 hover:cursor-pointer active:scale-95 rounded-lg font-medium shadow-lg transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none flex items-center justify-center"
            onClick={() =>
              sendRecording(
                "/api/patients",
                {
                  doctorId: "2ye8w7ty8f7",
                  text: transcript,
                },
                "Patients"
              )
            }
            disabled={isLoading || !transcript}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            {isLoading ? "Sending..." : "Save to Patients"}
          </button>
          <button
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 hover:cursor-pointer active:scale-95 rounded-lg font-medium shadow-lg transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none flex items-center justify-center"
            onClick={() =>
              sendRecording(
                "/api/visits",
                {
                  patientId: "9825aae5-8e73-4ed5-900a-680255e8c079",
                  text: transcript,
                },
                "Visits"
              )
            }
            disabled={isLoading || !transcript}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            {isLoading ? "Sending..." : "Save to Visits"}
          </button>
        </div>

        {/* Notification */}
        {notification.message && (
          <div
            className={`mt-6 px-4 py-3 rounded-lg flex items-center justify-center transition-all duration-300 ${
              notification.type === "error"
                ? "bg-red-900/40 text-red-200 border border-red-700/50"
                : notification.type === "success"
                ? "bg-green-900/40 text-green-200 border border-green-700/50"
                : "bg-blue-900/40 text-blue-200 border border-blue-700/50"
            }`}
          >
            <span className="mr-2">
              {notification.type === "error"
                ? "❌"
                : notification.type === "success"
                ? "✅"
                : "ℹ️"}
            </span>
            {notification.message}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        © 2025 Medical Voice Notes System
      </div>
    </div>
  );
}
