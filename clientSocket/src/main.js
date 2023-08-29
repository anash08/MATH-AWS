import React from 'react';
import './App.css';

function mainApp() {
    return (
        <div className="App">
            <h1 className="title"> Math Chemistry and  Symphony </h1>
            <div className="button-container">
                <a href="math_prompt.html" className="button">Math Prompt</a>
                <a href="chemistry_tutor.html" className="button">Chemistry Tutor</a>
                <a href="music_symphony.html" className="button">Music and Symphony</a>
            </div>
        </div>
    );
}

export default mainApp;
