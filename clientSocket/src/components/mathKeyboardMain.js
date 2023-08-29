/* eslint-disable jsx-a11y/anchor-is-valid */
import '../App.css'
// import '//unpkg.com/mathlive'
// import "https://unpkg.com/@cortex-js/compute-engine?module";
import mathlive from 'mathlive'; // Use the actual package name
import cortexComputeEngine from '@cortex-js/compute-engine'; // Use the actual package name

import "/home/pc/MY_app/math-Key/clientSocket/src/App.js"


import * as THREE from 'three';

import ScientificKeyboard from './wrtitingfunc';

import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import QRCode from "react-qr-code";
import { QrReader } from "react-qr-reader";
import axios from "axios";
import katex from "katex";

// import LatKeyboard from "./components/latexKeyboard";

import logoimg from "/home/pc/MY_app/math-Key/clientSocket/src/UnifyGPT-logo-300x55.png";

 const socket = io("https://unitysocketbuild.onrender.com/");
// const socket = io("http://localhost:9000");




const MathKeyCan = ({ goHome }) => {    


  const [conVal, setConVal] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [convertedValues, setConvertedValues] = useState(
    conVal !== null ? [conVal] : []
  );
  const [authenticated, setAuthenticated] = useState(false);
  const [authenticationCode, setAuthenticationCode] = useState("");
  const [showEnterCode, setShowEnterCode] = useState(true);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showScientificKeyboard, setShowScientificKeyboard] = useState(false);
  const [showMathKeyboard, setShowMathKeyboard] = useState(false);
  const [showChemistryKeyboard, setShowChemistryKeyboard] = useState(false);
  const canvasRef = useRef(null);
  const [convertedValue, setConvertedValue] = useState("");
  const [generations, setGenerations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState(" ");
  const [prompt, setPrompt] = useState("");
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [inputLatex, setInputLatex] = useState(false);

  const [responseLoaded, setResponseLoaded] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  const [chemResult, setChemResult] = useState(true);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const svgContent = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" id="send" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" class="icon flat-line"><path id="secondary" d="M5.44,4.15l14.65,7a1,1,0,0,1,0,1.8l-14.65,7A1,1,0,0,1,4.1,18.54l2.72-6.13a1.06,1.06,0,0,0,0-.82L4.1,5.46A1,1,0,0,1,5.44,4.15Z" style="fill: rgb(44, 169, 188); stroke-width: 2;"></path><path id="primary" d="M7,12h4M4.1,5.46l2.72,6.13a1.06,1.06,0,0,1,0,.82L4.1,18.54a1,1,0,0,0,1.34,1.31l14.65-7a1,1,0,0,0,0-1.8L5.44,4.15A1,1,0,0,0,4.1,5.46Z" style="fill: none; stroke: rgb(0, 0, 0); stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></svg>`;

  const [activeComponent, setActiveComponent] = useState("math");

  const toggleComponent = (component) => {
    setActiveComponent(activeComponent === component ? null : component);
  };

  // const toggleKeyboard = () => {
  //   setKeyboardVisible(!isKeyboardVisible);
  // };


  useEffect(() => {
    // const fetchConvertedValue = async () => {
    //   setIsLoading(true);
    //   try {
    //     // const response = await axios.get(
    //     //   "https://webhookforunity.onrender.com/convertedValue"
    //     // );
    //     const response = await axios.get(
    //       "http://localhost:5000/convertedValue"
    //     );
    //     console.log("Response data:", response.data.result1);
    //     setConVal(response.data.result1); // Assign response data directly to conVal
    //     setReloadCount((prevCount) => prevCount + 1);
    //   } catch (error) {
    //     console.error("Error fetching converted value:", error);
    //   }
    //   setIsLoading(false);
    // };
    // fetchConvertedValue();

    const isAuthenticated = localStorage.getItem("authenticated");
    if (isAuthenticated) {
      setAuthenticated(true);
      setShowEnterCode(false);
    }

    socket.on("authenticationCode", (code) => {
      setAuthenticationCode(code);
    });

    socket.on("convertedValue", (convertedValue) => {
      handleConvertedValue(convertedValue);
      console.log(".....................convertedValue..................", convertedValue);
    });

    socket.on("authenticated", () => {
      setAuthenticated(true);
      setShowEnterCode(false);
      localStorage.setItem("authenticated", true);
    });

    socket.on("newGeneration", (newGenerations) => {
      setGenerations(newGenerations);
    });

    socket.on("invalidCode", () => {
      alert("Invalid authentication code. Please try again.");
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleBeforeUnload = () => {
    localStorage.setItem("showKeyboard", showKeyboard ? "true" : "false");
  };

  const handleInput = (value) => {
    const updatedInput = input + value;
    const latex = katex.renderToString(updatedInput);

    // Update the input field with the rendered LaTeX
    const inpResultField = document.getElementById("inputId");
    inpResultField.value = latex;

    setInput(updatedInput);

    if (value === "\u232b") {
      // Handle backspace action
      const updatedInput = input.slice(0, -1); // Remove the last character from the input
      setInput(updatedInput);
    } else {
      // Handle other input actions
      setInput(updatedInput);
    }

    // Send the updatedInput value to the server
    socket.emit("convertedValue", updatedInput);
    setGenerations(true); // Show generations after converting the value
  };

  const handleChange = (event) => {
    setInput(event.target.value);
  };

  const handleConvertedValue = (convertedValue) => {
    setPrompt("");
    setShowPromptInput(true);
    setConvertedValues((prevConvertedValues) => [
      ...prevConvertedValues,
      convertedValue,
    ]);
    setInputLatex(convertedValue);
    console.log (".............//...........INPUT VALUE........", convertedValue)

    // setTimeout(() => {
    //   window.location.reload();
    // }, 10000);
  };

  const mathKeyboardButtonRef = useRef(null);

  useEffect(() => {
    // Check if it's the initial load after the page reload
    const initialLoad = sessionStorage.getItem("initialLoad");
    if (initialLoad === null) {
      // If it's the initial load, set showMathKeyboard to true
      setShowMathKeyboard(true);
      // Mark the initial load in session storage
      sessionStorage.setItem("initialLoad", "true");
    }
  }, []);

  useEffect(() => {
    // When the reloadCount changes, open the MathKeyboard
    if (reloadCount > 0) {
      setShowMathKeyboard(true);
    }
  }, [reloadCount]);

  const authenticate = (code) => {
    setIsLoading(true);

    socket.emit("authenticate", code);
    setTimeout(() => {
      setIsLoading(false);
    }, 10000);
  };



  useEffect(() => {
    // Check if the response loaded successfully
    if (convertedValues && convertedValues.length === 0) {
      setResponseLoaded(false);
    } else {
      setResponseLoaded(true);
    }
  }, [convertedValues]);




  //text input..............//...................
  //--------------------------------
  //--------------------------------
  const [inputText, setInputText] = useState("");

  const handleInputChange = (event) => {
    setInputText(event.target.value);
    console.log("InputText changed:", event.target.value);
  };

  const handleSubmit = async () => {
    // Handle form submission
    console.log("Input text:", inputText);
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/res2",
        {
          prompt: inputText,
        }
      );
      console.log("Response data:", response.data.res2);
      setConVal(response.data.res2); // Assign response data directly to conVal
      setReloadCount((prevCount) => prevCount + 1);
    } catch (error) {
      console.error("Error fetching converted value:", error);
    }
    setIsLoading(false);
  };


  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent the default form submission
      handleSubmit();
    }
  };

  //   const handleKeyEnter = (event) => {
  //     if (event.key === "Enter" && !event.shiftKey) {
  //       event.preventDefault(); // Prevent the default form submission
  //       handleSend();
  //       console.log("Enter key pressed", inputText);
  //     }
  //   };

  const handleKeyClick = (key) => {
    if (key === "space") {
      setInputText((prevInputText) => prevInputText + " ");
    } else {
      setInputText((prevInputText) => prevInputText + key);
    }

    console.log("..............//key pressed//...........", key);
  };


  const [value, setValue] = useState("");

  // Customize the mathfield when it is mounted
  const mf = useRef(null); // Initialize the ref with null

  useEffect(() => {
    // Check if the ref is not null before accessing its properties
    if (mf.current) {
      // Customize the mathfield when it is mounted
      mf.current.smartFence = true;

      // This could be an `onInput` handler, but this is an alternative
      mf.current.addEventListener("input", (evt) => {
        // When the return key is pressed, play a sound
        if (evt.inputType === "insertLineBreak") {
          // The mathfield is available as `evt.target`
          // The mathfield can be controlled with `executeCommand`
          // Read more: https://cortexjs.io/mathlive/guides/commands/
          evt.target.executeCommand("plonk");
        }
      });
    }
  }, []);



  // Update the mathfield when the value changes

  const packageElementRef = useRef(null);
  const [sendValue, setSendValue] = useState(" ")



  useEffect(() => {
    if (mf.current) {
      mf.current.value = value;
      console.log(".................//ValueLatex.//....................", value);

      const packageElement = document.querySelector('.action[tabindex="-1"]');
      if (packageElement) {
        packageElementRef.current = packageElement;
      }

      let enterKeyPressed = false;

      const handleKeyDown = (ev) => {
        if (ev.key === 'Enter') {
          if (!enterKeyPressed) {
            console.log(".........ENTER PRESSED........", value);
            sendValueToBackend(value);
            mf.current.executeCommand("moveToNextPlaceholder");
            enterKeyPressed = true;
            mf.current.blur();

          }
          ev.preventDefault();
        }
      };


      
      const handleMathFieldChange = () => {
        const mathFieldValue = mf.current.getValue();
        // console.log('Value::_________', mathFieldValue);
        setSendValue(mathFieldValue);
        // enterKeyPressed = false; // Reset the flag on each change
        console.log("........||STATE VALUE STATE VALUE||................", mathFieldValue)
        axios.post('http://localhost:5000/webhook', { mathFieldValue })
          .then((response) => {
            // Handle the response if needed
            console.log('Response:', response.data);
            setConVal(response.data); // Assign response data directly to conVal

            setReloadCount((prevCount) => prevCount + 1);
          })

          .catch((error) => {
            // Handle any errors that occurred during the request
            console.error('Error:', error);
          });
        setIsLoading(false);

      };

      // mf.current.addEventListener('keydown', handleKeyDown);
      mf.current.addEventListener('change', handleMathFieldChange);
      // window.location.reload();
      return () => {
        // Clean up the event listener when the component is unmounted
        if (mf.current) {
          mf.current.removeEventListener('keydown', handleKeyDown);
          mf.current.removeEventListener('change', handleMathFieldChange);
        }
      };
    }
  }, [value]);






  const handleButtonClick = () => {
    console.log("...........//.......//PACKAAGEEEEE//..............")

    if (packageElementRef.current) {
      packageElementRef.current.click();
      // console.log("...........//.......//PACKAAGEEEEE//..............",packageElementRef.current )
    }
  };
  const sendValueToBackend = (val) => {
    console.log(".......................//...........clickedddddsend")

  };
  return (
    <div className='App'>
      
        <div>
            <div>
              <div class="header">
                <div className="Header-img-svg">
                  <a href="https://www.webtiga.com/unify-gpt/">
                    <img className="logo-img" src={logoimg} alt="Logo" />
                  </a>

                  <div className='HomeButton' style={{
                 
                  }}>
                    <h2 style={{
                     
                    }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'rotateY(360deg) translateZ(30px)'; // Rotate and move forward on hover
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'rotateY(0deg) translateZ(0)'; // Restore rotation and position on hover out
                      }}
                    >
                      MathKeyboard
                    </h2>
                  </div>







                  <div className='CanvasComponent'>
                    <ScientificKeyboard
                      input={input}
                      setInput={setInput}
                      handleInput={handleInput}
                      setInputValue={setInputValue}
                      setConvertedValue={setConvertedValue}
                      canvasRef={canvasRef}
                      setIsLoading={setIsLoading}

                    />

                  </div>

                </div>

              </div>

              <div>


                <div style={{ textAlign: "center" }}>
                  {generations.map((generation, index) => (
                    <div key={index} style={{ marginTop: "10px" }}>
                      <div className="generation-text">{generation.prompt}</div>
                      <div className="generation-text">
                        {generation.response}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </div>
    </div >
  );
};

export default MathKeyCan;
