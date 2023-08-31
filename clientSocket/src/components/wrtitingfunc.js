import React, { useRef, useEffect, useState } from "react";

import _ from 'lodash';


import mathlive from 'mathlive'; // Use the actual package name
import cortexComputeEngine from '@cortex-js/compute-engine'; // Use the actual

import axios from "axios";
import katex from "katex";
import deleteIcon from "../Delete-btn.svg";
import io from "socket.io-client";
import QRCode from "react-qr-code";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import ReactDOM from "react-dom";
import { QrReader } from "react-qr-reader";
import undoIcon from "../noun-undo-btn.svg"; // Import the SVG image
import redoIcon from "../noun-redo-btn.svg"; // Import
import convertIcon from "../convertIcon.svg"; // Import
import sendIcon from "../send-btn.svg"; // Import

import "../index.css";
import "../App.css";
import * as iink from "iink-js";



// const socket = io("http://18.191.250.59:9000");
// const socket = io("http://localhost:9000");
const socket = io("https://unitysocketbuild.onrender.com");

const URL = "http://18.191.250.59:9000";
//............................///..................................//
const ScientificKeyboard = ({
  handleInput,
  handleConvertedValue,
  convertedValues,
  setConvertedValues,
  generations,
  isKeyboardVisible,
}) => {
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [previousConvertedValues, setPreviousConvertedValues] = useState([]);

  const [resultValue, setresultValue] = useState("");
  const [penType, setPenType] = useState("PEN");
  const [userCode, setUserCode] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authenticationCode, setAuthenticationCode] = useState("");
  const [showEnterCode, setShowEnterCode] = useState(true);
  const [responses, setResponses] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [conVal, setConVal] = useState(true);
  const [fetchedData, setFetchedData] = useState(""); // Step 2





  const svgContent = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" id="send" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" class="icon flat-line"><path id="secondary" d="M5.44,4.15l14.65,7a1,1,0,0,1,0,1.8l-14.65,7A1,1,0,0,1,4.1,18.54l2.72-6.13a1.06,1.06,0,0,0,0-.82L4.1,5.46A1,1,0,0,1,5.44,4.15Z" style="fill: rgb(44, 169, 188); stroke-width: 2;"></path><path id="primary" d="M7,12h4M4.1,5.46l2.72,6.13a1.06,1.06,0,0,1,0,.82L4.1,18.54a1,1,0,0,0,1.34,1.31l14.65-7a1,1,0,0,0,0-1.8L5.44,4.15A1,1,0,0,0,4.1,5.46Z" style="fill: none; stroke: rgb(0, 0, 0); stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></svg>`;


  const editorElement = document.getElementById("editor");
  const resultElement = document.getElementById("result");
  const undoElement = document.getElementById("undo");
  const redoElement = document.getElementById("redo");
  const clearElement = document.getElementById("clear");
  const convertElement = document.getElementById("convert");
  const eraserElement = document.getElementById("eraser");
  const penElement = document.getElementById("pen");
  const erasePreciselyElement = document.getElementById("erase-precisely");







  const cleanLatex = (latexExport) => {
    if (latexExport.includes("\\\\")) {
      const steps = "\\begin{align*}" + latexExport + "\\end{align*}";
      return steps
        .replace("\\begin{aligned}", "")
        .replace("\\end{aligned}", "")
        .replace(new RegExp("(align.{1})", "g"), "aligned");
    }
    return latexExport.replace(new RegExp("(align.{1})", "g"), "aligned");
  };
  const handleExported = (evt) => {
    const exports = evt.detail.exports;
    if (exports && exports["application/x-latex"]) {
      const cleanedLatex = cleanLatex(exports["application/x-latex"]);
      resultElement.innerHTML = cleanedLatex;
      convertElement.disabled = false;
    } else if (exports && exports["application/mathml+xml"]) {
      convertElement.disabled = false;
      // resultElement.innerText = exports['application/mathml+xml'];
    } else if (exports && exports["application/mathofficeXML"]) {
      convertElement.disabled = false;
      resultElement.innerText = exports["application/mathofficeXML"];
    } else {
      convertElement.disabled = true;
      resultElement.innerHTML = "";
    }
  };
  const handleChanged = (event) => {
    undoElement.disabled = !event.detail.canUndo;
    redoElement.disabled = !event.detail.canRedo;
    clearElement.disabled = event.detail.isEmpty;

    handleExported(event);
    console.log("........Event..............//", event);
  };

  const handleUndo = () => {
    editorElement.editor.undo();
  };

  const handleRedo = () => {
    editorElement.editor.redo();

  };

  const handleClear = () => {
    console.log("////////cleared.........//")
    editorElement.editor.clear();
    socket.emit("clearScreen");
    setFetchedData(null); // Clear the fetchedData
    clearElement.disabled = false;
  };

  const handleResult = () => {
    editorElement.editor.resUpdate("result");
    console.log("result from editor was.................//");
  };

  const handleConvertElement = () => {
    editorElement.editor.convert();
    const convertedValue = resultElement.innerText; // Get the converted value
    setPreviousConvertedValues(prevValues => [...prevValues, convertedValue]);
    // Emit the converted value through the socket
    socket.emit("convertedValue", convertedValue);
    clearElement.disabled = false;

  };

  // Use useEffect to log the updated previousConvertedValues
  useEffect(() => {
    console.log("Updated previousConvertedValues:", previousConvertedValues);
  }, [previousConvertedValues]); // Run the effect whenever previousConvertedValues changes


  const handlePen = () => {
    console.log("Handle pen selection change");
    setPenType("PEN");
    eraserElement.disabled = false;
    eraserElement.classList.remove("active");
    penElement.disabled = true;
    penElement.classList.add("active");
  };

  const handleEraser = () => {
    setPenType("ERASER");
    eraserElement.disabled = true;
    eraserElement.classList.add("active");
    penElement.disabled = false;
    penElement.classList.remove("active");
  };

  const handleErasePrecisely = (e) => {
    const configuration = { ...editorElement.editor.configuration };
    configuration.recognitionParams.iink.math.eraser = {
      "erase-precisely": e.target.checked,
    };
    editorElement.editor.configuration = configuration;
  };

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


  useEffect(() => {
    const editorElement = document.getElementById("editor");
    const resultElement = document.getElementById("result");
    const undoElement = document.getElementById("undo");
    const redoElement = document.getElementById("redo");
    const clearElement = document.getElementById("clear");
    const convertElement = document.getElementById("convert");
    const eraserElement = document.getElementById("eraser");
    const penElement = document.getElementById("pen");
    const erasePreciselyElement = document.getElementById("erase-precisely");

    const cleanLatex = (latexExport) => {
      if (latexExport.includes("\\\\")) {
        const steps = "\\begin{align*}" + latexExport + "\\end{align*}";
        return steps
          .replace("\\begin{aligned}", "")
          .replace("\\end{aligned}", "")
          .replace(new RegExp("(align.{1})", "g"), "aligned");
      }
      return latexExport.replace(new RegExp("(align.{1})", "g"), "aligned");
    };
    const handleExported = (evt) => {
      const exports = evt.detail.exports;
      if (exports && exports["application/x-latex"]) {
        const cleanedLatex = cleanLatex(exports["application/x-latex"]);
        resultElement.innerHTML = cleanedLatex;
        convertElement.disabled = false;
      } else if (exports && exports["application/mathml+xml"]) {
        convertElement.disabled = false;
        // resultElement.innerText = exports['application/mathml+xml'];
      } else if (exports && exports["application/mathofficeXML"]) {
        convertElement.disabled = false;
        resultElement.innerText = exports["application/mathofficeXML"];
      } else {
        convertElement.disabled = true;
        resultElement.innerHTML = "";
      }
    };
    const handleChanged = (event) => {
      undoElement.disabled = !event.detail.canUndo;
      redoElement.disabled = !event.detail.canRedo;
      //clearElement.disabled = event.detail.isEmpty;

      handleExported(event);
      console.log("........Event..............//", event);
    };

    const handleUndo = () => {
      editorElement.editor.undo();
    };

    const handleRedo = () => {
      editorElement.editor.redo();

    };

    const handleClear = () => {
      console.log("////////cleared.........//")
      editorElement.editor.clear();
      socket.emit("clearScreen");
    };


    const handleConvert = () => {
      editorElement.editor.convert();
      const convertedValue = resultElement.innerText; // Get the converted value

      // Update the state once with both previous and new values
      // setPreviousConvertedValues(prevValues => [...prevValues, convertedValue]);

      // const symbols = katex.renderToString(convertedValue);

      socket.emit("convertedValue", convertedValue);
      // console.log("the value of the converted Value the latex conversion........//,........", convertedValue) // Emit the converted value through the socket
      // handleConvertedValue(convertedValue);
      // console.log("Converted value", convertedValue);
      // generations(editorElement.editor)
    };

    const handlePen = () => {
      console.log("Handle pen selection change");
      setPenType("PEN");
      eraserElement.disabled = false;
      eraserElement.classList.remove("active");
      penElement.disabled = true;
      penElement.classList.add("active");
    };

    const handleEraser = () => {
      setPenType("ERASER");
      eraserElement.disabled = true;
      eraserElement.classList.add("active");
      penElement.disabled = false;
      penElement.classList.remove("active");
    };

    const handleErasePrecisely = (e) => {
      const configuration = { ...editorElement.editor.configuration };
      configuration.recognitionParams.iink.math.eraser = {
        "erase-precisely": e.target.checked,
      };
      editorElement.editor.configuration = configuration;
    };

    editorElement.addEventListener("changed", handleChanged);
    editorElement.addEventListener("exported", handleExported);
    undoElement.addEventListener("click", handleUndo);
    redoElement.addEventListener("click", handleRedo);
    clearElement.addEventListener("click", handleClear);
    convertElement.addEventListener("click", handleConvert);
    // resultElement.addEventListener('click', handleResult);

    const recognitionParams = {
      type: "MATH",
      protocol: "WEBSOCKET",
      server: {
        scheme: "https",
        host: "webdemoapi.myscript.com",
        applicationKey: "da4d9314-3f94-4e4c-be14-d57fdd71adde",
        hmacKey: "6d36bbad-9527-4062-8268-e686bd56640f",
      },
      iink: {
        math: {
          mimeTypes: [
            "application/x-latex",
            "application/vnd.myscript.jiix",
            "application/mathml+xml",
          ],
        },
        eraser: {
          "erase-precisely": false,
        },
        export: {
          jiix: {
            strokes: true,
          },
        },
      },
    };
    iink.register(editorElement, {
      recognitionParams: recognitionParams,
      iink: {
        eraser: {
          "erase-precisely": false,
        },
        export: {
          jiix: {
            strokes: true,
          },
        },
      },
    });
    socket.on("convertedValue", (convertedValue) => {
      // Clear the editor element before rendering the converted value
      const editorElement = document.getElementById("editor");
      editorElement.innerHTML = "";

      // Render the converted value using KaTeX and append it to the editor element
      const renderedValue = katex.renderToString(convertedValue);
      const mathNode = document.createElement("div");
      mathNode.innerHTML = renderedValue;

      editorElement.appendChild(mathNode);
      mathNode.style.fontSize = "70px";
      mathNode.style.position = "fixed";
      mathNode.style.zIndex = "9999"; // Higher value to bring it to the front
      mathNode.style.right = "8%"; // Adjust the vertical position as needed
      mathNode.style.bottom = "40%"; // Adjust the horizontal position as needed
      mathNode.style.color = "black"; // Adjust the horizontal position as needed
      mathNode.style.transform = "translate(-50%, -50%)";

      if (convertedValue.trim() === "") {
        editorElement.removeChild(mathNode);
      }

      // Update the result element with the received converted value
      const resultElement = document.getElementById("result");
      resultElement.innerHTML = "";

      try {
        // Create a new container for the converted value
        const convertedValueContainer = document.createElement("div");
        convertedValueContainer.innerHTML = renderedValue;
        convertedValueContainer.style.fontSize = "70px";
        convertedValueContainer.style.marginRight = "10px"; // Adjust the spacing between converted values

        // Append the container to the container for converted values
        const convertedValuesContainer = document.getElementById(
          "convertedValuesContainer"
        );
        convertedValuesContainer.appendChild(convertedValueContainer);
      } catch (error) {
        console.error("Error appending converted value:", error);
      }
    });

    socket.on("clearScreen", () => {
      // Clear the editor element
      // const editorElement = document.getElementById("editor");
      // editorElement.innerHTML = "";

      // Clear the result element
      const resultElement = document.getElementById("result");
      resultElement.innerHTML = "";
      // eslint-disable-next-line no-restricted-globals
      // location.reload();
    });

    // socket.on("authenticationCode", (code) => {
    //   // Handle the authentication code received from the server
    //   console.log("Received authentication code:", code);
    //   // Display the code in your HTML or manipulate it as needed
    //   // For example, you could update a <div> element with the code:
    //   document.getElementById("codeDisplay").textContent = code;
    // });



    window.addEventListener("resize", () => {
      editorElement.editor.resize();
    });

    // Clean up event listeners on component unmount
    return () => {
      editorElement.removeEventListener("changed", handleChanged);
      editorElement.removeEventListener("exported", handleExported);
      undoElement.removeEventListener("click", handleUndo);
      redoElement.removeEventListener("click", handleRedo);
      clearElement.removeEventListener("click", handleClear);
      convertElement.removeEventListener("click", handleConvert);
      socket.off("convertedValue");
      socket.off("authenticationCode");

      // resultElement.removeEventListener('click', handleResult);

      window.removeEventListener("resize", () => {
        editorElement.editor.resize();
      });
    };
  }, [conVal]);

  const res = document.getElementById("result");
  const handleClick = (symbol) => {
    handleInput(symbol);
    if (res) {
      setresultValue(res.innerText);
    }
  };
  const handleSubmit = () => {
    socket.emit("userCode", userCode);
  };



  const handleSend = async () => {
    const sendElement = document.getElementById("sendValueLatex");
    const convertedValue = sendElement.innerText; // Get the converted value
    console.log("....VALUE...", convertedValue);
    
    // try {
    //   // Make a POST request to the server with the converted value
    //   const response = await axios.post("https://webhookforunity.onrender.com/webhook", {
    //   // const response = await axios.post("http://localhost:5000/webhook", {
    //     convertedValue,
    //   });

    //   // Clear the editor content
    //   handleClear()
    //   // Update the state with the response data
    //   setFetchedData(response.data);
    // } catch (error) {
    //   console.error("Error sending converted value:", error);
    // }

    // Clear the previous converted values and the send element
    setPreviousConvertedValues([]);
    sendElement.innerText = "";
  };


  useEffect(() => {
    console.log(".........FETCHED DATA............", fetchedData);
  }, [fetchedData]);



  const [conValGen, setConValGen] = useState(true);

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




  const packageElementRef = useRef(null);
  const [sendValue, setSendValue] = useState(" ")
  const [reloadCount, setReloadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");


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
        // axios.post('http://localhost:5000/webhook', { mathFieldValue })
        //   .then((response) => {
        //     // Handle the response if needed
        //     console.log('Response:', response.data);
        //     setConValGen(response.data); // Assign response data directly to conVal

        //     setReloadCount((prevCount) => prevCount + 1);
        //   })

        //   .catch((error) => {
        //     // Handle any errors that occurred during the request
        //     console.error('Error:', error);
        //   });
        // setIsLoading(false);

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






  // const ITEM_HEIGHT = 48;


  // const handleMenuClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleMenuClose = () => {
  //   setAnchorEl(null);
  // };


  return (
    <div>



      <div
        id="editor"
        className="canvas-editor "
        style={{

        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
          id="convertedValuesContainer"
        >

          {/* Rendered converted values will go here */}
        </div>



        <h1 style={{ color: "grey" }}>Write Here:</h1>






        <code> {value}</code>

        <div className="ThreeDotMenu">
          <nav
            style={{
              width: "100%",
              backgroundColor: "white",
              padding: "10px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
              zIndex: "1",
              position: "sticky",
              top: "0",
              display: "contents",
            }}
          >
            <div className="button-div">


              {/* Dropdown Button */}


              <div className="dropdown">
                <button className="dropbtn">&#x22EE;</button>
                <div className="dropdown-content">


                  {/* Buttons in Dropdown */}


                  <button id="clear" onClick={handleClear} disabled={false} style={{
                    // backgroundColor: "#0383be",
                    // boxShadow: "0px 2px 4px rgba(0, 255, 255, 0.3)",
                    backgroundColor: "transparent",

                    padding: "14px",
                    backgroundImage: `url(${deleteIcon})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    marginBottom: "8px",
                  }}>
                    <deleteIcon style={{ width: "70%", height: "70%" }} />
                  </button>


                  <button id="undo" onClick={handleUndo} style={{
                    // boxShadow: "0px 2px 4px rgba(0, 255, 255, 0.3)",
                    backgroundColor: "transparent",

                    padding: "14px",
                    backgroundImage: `url(${undoIcon})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    marginBottom: "8px",
                  }}>
                    <undoIcon style={{ width: "70%", height: "70%" }} />
                  </button>


                  <button id="redo" onClick={handleRedo} style={{
                    // backgroundColor: "#0383be",
                    // boxShadow: "0px 2px 4px rgba(0, 255, 255, 0.3)",
                    backgroundColor: "transparent",

                    padding: "14px",
                    backgroundImage: `url(${redoIcon})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    marginBottom: "8px",
                  }}>
                    <redoIcon style={{ width: "70%", height: "70%" }} />

                  </button>


                  <button id="convert" onClick={handleConvertElement} style={{
                    // boxShadow: "0px 2px 4px rgba(0, 255, 255, 0.3)",
                    padding: "14px", // Add padding here to increase the size of the button
                    backgroundImage: `url(${convertIcon})`,

                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundColor: "transparent",

                    backgroundPosition: "center",
                    marginBottom: "8px",
                  }}>
                    <convertIcon style={{ width: "70%", height: "70%" }} />

                  </button>




                  {/* Add other buttons as needed */}
                </div>
              </div>
            </div>
          </nav>
        </div>


        <div>
          <div className="response-container">
            {fetchedData &&
              fetchedData.split('\n').map((step) => (
                <div key={step} style={{ color: 'black', fontSize: '16px' }}>{step}<br /></div>
              ))}
          </div>
        </div>

        <div
          className="Input-latex"
          style={{
          }}
        >




          <button
            className="send-btn"
            id="send"
            style={{
              // boxShadow: "white",
              padding: "60px", // Add padding here to increase the size of the button
              backgroundImage: `url(${sendIcon})`,

              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundColor: "transparent",
              backgroundPosition: "center",
            }}
            onClick={handleSend}
          >
            <sendIcon style={{ width: "70%", height: "50%" }} />

          </button>




        </div>

        


      </div>
      <div className="ConvertedLatex" id="sendValueLatex"
        style={{

        }}
      >
        {previousConvertedValues.join(" ")}
      </div>


      <div className="latex-header" style={{ display: "-ms-flexbox" }}>

        {/* <div
          id="codeDisplay"
          style={{ position: "absolute", top: 0, right: 0 }}
        ></div> */}
        {/* <QRCode
          value={URL.toString()}
          size={128}
          style={{ position: "absolute", top: 0, right: 0 }}
        /> */}


        <div style={{
          display: 'table',
          // border: '2px solid #00537f', // Darker border color
          borderRadius: '20px',
          marginTop: '1vh',
          // fontFamily: 'system-ui',
        }}>
          <h2 className= "Latex-field" style={{
            display: 'flex',
            // background: 'linear-gradient(135deg, #00537f, #002b40)',
            // background: "#9B9C9E",
            padding: '2px 20px',
            borderRadius: '8px',
            // boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            margin: 0,
            fontWeight: 'bold',
            transform: 'rotateY(0deg) translateZ(0)',

          }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'rotateY(360deg) translateZ(30px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'rotateY(0deg) translateZ(0)';
            }}


          >
            LaTeX


            {/*             
            <math-field ref={mf} onInput={(evt) => setValue(evt.target.value)}>
                      {value}
                    </math-field> */}

          </h2>
        </div>



        <div
          id="result"
          className="blackboard"
          style={{

            color: "white",

          }}
        >
          {convertedValues && (
            <div>
              {convertedValues.map((value, index) => (
                <div key={index}>{value}</div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
export default ScientificKeyboard;