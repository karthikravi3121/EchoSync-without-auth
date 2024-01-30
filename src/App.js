// Import necessary libraries
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, onValue } from 'firebase/database';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';

const firebaseConfig = {
  apiKey: "AIzaSyBSlJtgOe2IyNx3ILi1TquSTCIxGzPae64",
  authDomain: "echosync-b35db.firebaseapp.com",
  databaseURL: "https://echosync-b35db-default-rtdb.firebaseio.com",
  projectId: "echosync-b35db",
  storageBucket: "echosync-b35db.appspot.com",
  messagingSenderId: "873474629370",
  appId: "1:873474629370:web:853872cadc8c06669ab343",
  measurementId: "G-717Y93KEDJ"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const Home = () => {
  const [code, setCode] = useState('');
  const [texts, setTexts] = useState([]);
  const [copiedButtons, setCopiedButtons] = useState({});
  const [clickedButton, setClickedButton] = useState(null);
  const [downloadHovered, setDownloadHovered] = useState(null);

  useEffect(() => {
    const textsRef = ref(database, 'texts');

    const unsubscribe = onValue(textsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const textsArray = Object.entries(data).map(([key, value]) => ({ id: key, ...value }));
        setTexts(textsArray);
      }
    });

    return () => unsubscribe();
  }, [database]);

  const saveToFirebase = async () => {
    if (code.trim() === '') {
      return;
    }

    const newCodeName = window.prompt('Enter a name for the text:');
    if (!newCodeName) {
      return;
    }

    const existingFileName = texts.find((item) => item.name === newCodeName);
    if (existingFileName) {
      alert('A file with the same name already exists. Please choose a different name.');
      return;
    }

    const textsRef = ref(database, 'texts');
    const newCodeRef = push(textsRef);

    try {
      await set(newCodeRef, { name: newCodeName, content: code });
    } catch (error) {
      console.error('Error saving to Firebase: ', error);
    }

    setCode('');
  };

  const handleCopyClick = (content, buttonId) => {
    const textarea = document.createElement('textarea');
    textarea.value = content;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    setCopiedButtons((prevButtons) => ({
      ...prevButtons,
      [buttonId]: true,
    }));

    setClickedButton(buttonId);

    setTimeout(() => {
      setCopiedButtons((prevButtons) => ({
        ...prevButtons,
        [buttonId]: false,
      }));
      setClickedButton(null);
    }, 2000);
  };

  const handleFileDownload = (content, fileName) => {
    const link = document.createElement('a');
    link.href = content;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadHover = (isHovered, itemId) => {
    setDownloadHovered(isHovered ? itemId : null);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target.result;

      const newFileName = window.prompt('Enter a name for the file:');
      if (!newFileName) {
        return;
      }

      const existingFileName = texts.find((item) => item.name === newFileName);
      if (existingFileName) {
        alert('A file with the same name already exists. Please choose a different name.');
        return;
      }

      const textsRef = ref(database, 'texts');
      const newFileRef = push(textsRef);

      try {
        await set(newFileRef, { name: newFileName, content: fileContent });
      } catch (error) {
        console.error('Error saving file to Firebase: ', error);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="container">
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Drop Here"
        className="code-input"
      />
      <br />
      <br />
      {/* EXPORT button with arrow-up SVG icon */}
      <button onClick={saveToFirebase} className="button-style" title="Export">
        <Link
          to=""
          className="export-link"
          style={{ textDecoration: 'none', color: 'black' }}
        >
          {/* Arrow-up SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="40"
            height="40"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </Link>
      </button>

      {/* File UPLOAD button */}
      <button>
        <label htmlFor="file-upload" className="button-style" title="Upload File" style={{ cursor: 'pointer' }}>
          {/* Replace "UPLOAD" text with a file upload SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="40"
            height="40"
            fill="purple"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="8" x2="8" y2="8"></line>
            <line x1="16" y1="12" x2="8" y2="12"></line>
            <line x1="16" y1="16" x2="8" y2="16"></line>
          </svg>
        </label>
      </button>

      <input
        type="file"
        id="file-upload"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      <div className="codes-container">
        {texts.map((item) => (
          <div key={item.id} className="code-item">
            <pre className="code-display">{item.name}</pre>
            {item.content.startsWith('data:') ? (
              <button
                onMouseEnter={() => handleDownloadHover(true, item.id)}
                onMouseLeave={() => handleDownloadHover(false, item.id)}
                onClick={() => handleFileDownload(item.content, item.name)}
                className={`download-button ${downloadHovered === item.id ? 'hovered' : ''}`}
                title="Download"
              >
                {/* Download SVG icon with ID and class */}
                <svg
                  id={`download-icon-${item.id}`}
                  className={`download-icon ${downloadHovered === item.id ? 'hovered' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="40"
                  height="40"
                  fill="none"
                  stroke="red"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path>
                </svg>
              </button>
            ) : (
              <button
                onClick={() => handleCopyClick(item.content, item.id)}
                className={`copy-button ${clickedButton === item.id ? 'clicked' : ''}`}
                title="Click to Copy"
              >
                {copiedButtons[item.id] ? (
                  <span role="img" aria-label="tick-mark" style={{ marginRight: '5px' }}>
                    ✔️
                  </span>
                ) : (
                  'COPY'
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
