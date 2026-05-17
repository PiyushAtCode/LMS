import React, { useState } from 'react'
import ai from "../assets/ai.png"
import ai1 from "../assets/SearchAi.png"
import { RiMicAiFill } from "react-icons/ri";
import axios from 'axios';
import { serverUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import start from "../assets/start.mp3"
import { FaArrowLeftLong } from "react-icons/fa6";

function SearchWithAi() {
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [listening, setListening] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate();
  const startSound = new Audio(start)

  function speak(message) {
    let utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const handleSearch = async () => {
    if (!recognition) return;

    setListening(true)
    startSound.play()

    recognition.start();

    recognition.onresult = async (e) => {
      const transcript = e.results[0][0].transcript.trim();
      setInput(transcript);
      await handleRecommendation(transcript);
    };
  };

  // 🔥 FINAL SMART LOGIC
  const handleRecommendation = async (query) => {
    try {
      setLoading(true)

      const result = await axios.post(
        `${serverUrl}/api/ai/search`,
        { input: query },
        { withCredentials: true }
      );

      const data = result.data || [];

      // ✅ STEP 1: Exact match
      const exactMatch = data.filter(course =>
        course.title.toLowerCase().includes(query.toLowerCase())
      );

      if (exactMatch.length > 0) {
        setRecommendations(exactMatch);
        speak("Showing exact courses")
      } 
      else if (data.length > 0) {
        // ✅ STEP 2: AI related
        setRecommendations(data);
        speak("Showing related courses")
      } 
      else {
        // ❌ STEP 3: Nothing
        setRecommendations([]);
        speak("No courses found")
      }

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
      setListening(false)
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex flex-col items-center px-4 py-16">

      {/* SEARCH BOX */}
      <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-8 w-full max-w-2xl text-center relative">
        <FaArrowLeftLong
          className='text-black w-[22px] h-[22px] cursor-pointer absolute'
          onClick={() => navigate("/")}
        />

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-6 flex items-center justify-center gap-2">
          <img src={ai} className='w-8 h-8' alt="AI" />
          Search with <span className='text-[#CB99C7]'>AI</span>
        </h1>

        <div className="flex items-center bg-gray-700 rounded-full overflow-hidden shadow-lg relative w-full">

          <input
            type="text"
            className="flex-grow px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            placeholder="Search like AI, Web Development..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {input && (
            <button
              onClick={() => handleRecommendation(input)}
              className="absolute right-14 bg-white rounded-full"
            >
              <img src={ai} className='w-10 h-10 p-2 rounded-full' alt="Search" />
            </button>
          )}

          <button
            className="absolute right-2 bg-white rounded-full w-10 h-10 flex items-center justify-center"
            onClick={handleSearch}
          >
            <RiMicAiFill className="w-5 h-5 text-[#cb87c5]" />
          </button>
        </div>
      </div>

      {/* STATUS */}
      {loading && <h1 className='mt-10 text-gray-400'>Searching...</h1>}
      {listening && <h1 className='mt-10 text-gray-400'>Listening...</h1>}

      {/* RESULTS */}
      {recommendations.length > 0 && (
        <div className="w-full max-w-6xl mt-12">
          <h2 className="text-2xl mb-6 text-center flex items-center justify-center gap-3">
            <img src={ai1} className="w-12 h-12" alt="AI Results" />
            AI Results
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recommendations.map((course) => (
              <div
                key={course._id}
                className="bg-white text-black p-5 rounded-2xl cursor-pointer hover:bg-gray-200"
                onClick={() => navigate(`/viewcourse/${course._id}`)}
              >
                <h3 className="text-lg font-bold">{course.title}</h3>
                <p className="text-sm text-gray-600">{course.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NO RESULT */}
      {!loading && recommendations.length === 0 && !listening && (
        <h1 className='mt-10 text-xl text-gray-400'>No Courses Found</h1>
      )}

    </div>
  );
}

export default SearchWithAi;