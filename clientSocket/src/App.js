

import React, { useState } from 'react';
import './App.css';
import MathKeyCan from './components/mathKeyboardMain';
import logoimg from "/home/pc/MY_app/math-Key/clientSocket/src/UnifyGPT-logo-300x55.png";

function App() {
  const [showMath, setShowMath] = useState(true); // Change the initial state to true

  const handleHomeClick = () => {
    setShowMath(false);
  };

  return (
    <div className="App">
      {showMath ? (
        <MathKeyCan goHome={handleHomeClick} />
      ) : (
        <div className="Header-img-svg">
          <a href="https://www.webtiga.com/unify-gpt/">
            <img className="logo-img" src={logoimg} alt="Logo" />
          </a>
          <div className="HomePageButtons">
            {/* Add any additional buttons or content here */}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
