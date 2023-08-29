import React from "react";
import katex from "katex";

const LatKeyboard = ({ handleKeyClick }) => {
  const handleClick = (key) => {
    console.log(".............//key pressed//....................//\\||", key);
    handleKeyClick(key);
  };

  const renderKey = (key) => {
    const renderedKey = katex.renderToString(key, { throwOnError: false });

    return (
      <button
        key={key}
        onClick={() => handleClick(key)}
        style={{ margin: "5px" }}
      >
        <span dangerouslySetInnerHTML={{ __html: renderedKey }} />
      </button>
    );
  };

  const keys = [
    [
      "\\sin",
      "\\cos",
      "\\tan",
      "\\cot",
      "\\sec",
      "\\csc",
      "\\arcsin",
      "\\arccos",
      "\\arctan",
    ],
    [
      "\\text{acot}",
      "\\text{asec}",
      "\\text{acsc}",
      "\\log",
      "\\ln",
      "\\exp",
      "\\sqrt{}",
      "\\sqrt[3]{}",
      "\\sqrt[4]{}",
    ],
    [
      "x^n",
      "x^2",
      "x^3",
      "\\int",
      "\\iint",
      "\\iiint",
      "\\oint",
      "\\oiint",
      "\\oiiint",
      "\\nabla",
      "\\Delta",
      "\\partial",
    ],
    [
      "\\pi",
      "\\text{e}",
      "\\varphi",
      "\\gamma",
      "\\phi",
      "\\theta",
      "\\lambda",
      "\\mu",
      "\\nu",
    ],
    [
      "\\rho",
      "\\sigma",
      "\\tau",
      "\\omega",
      "<",
      ">",
      "\\neq",
      "\\approx",
      "\\cong",
      "\\equiv",
      "\\not\\equiv",
    ],
    [
      "\\prec",
      "\\succ",
      "\\preceq",
      "\\succeq",
      "\\in",
      "\\notin",
      "\\ni",
      "\\not\\ni",
      "\\subset",
      "\\supset",
    ],
    [
      "\\subseteq",
      "\\supseteq",
      "\\nsubseteq",
      "\\nsupseteq",
      "\\forall",
      "\\exists",
      "\\nexists",
      "\\land",
    ],
    [
      "\\lor",
      "\\neg",
      "\\implies",
      "\\iff",
      "%",
      "\\pm",
      "!",
      "^\\circ",
      "\\div",
      "\\times",
    ],
    [
      "\\cdot",
      "\\mp",
      "\\square\\mkern-10mu\\raisebox{0.3ex}{\\small{$\\scriptstyle\\langle$}}",
      "\\angle",
    ],
    [
      "\\measuredangle",
      "\\sphericalangle",
      "\\parallel",
      "\\nparallel",
      "\\mid",
      "\\perp",
      "\\infty",
    ],
    ["1", "2", "3"],
    ["4", "5", "6", "+"],
    ["7", "8", "9", "-"],
    [".", "0", "=", "*", "\u232b"],
  ];

  return (
    <div className="latexkeyboard">
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {keys.map((keyGroup, index) => (
          <div key={index}>{keyGroup.map((key) => renderKey(key))}</div>
        ))}
      </div>
    </div>
  );
};

export default LatKeyboard;
