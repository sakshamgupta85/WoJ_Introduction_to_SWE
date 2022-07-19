import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
let currentPlayer = 0;
let scores = [0, 0];
let success = "";
let used = <mark>100</mark>;
function Main() {
const [guess, setGuess] = useState("");


function submitGuess() {
  console.log('button pressed');
  // add here the logic to change the point values 
  // and extract teh text contained in the textbox
  console.log("woo they guessed : ", guess);
  if (guess == "answer") {
    scores[currentPlayer] += 100;
    success = "That was right! Returning to wheel.";
  } else {
    scores[currentPlayer] -= 100;
    success = "That was wrong. Returning to wheel.";
  }
  // currentPlayer += 1;
  // currentPlayer %= 2;
  used = "-";
  console.log(currentPlayer);
  setGuess("");
  root.render(
    <Main />
  );
}

function doChange(event){
  setGuess(event.target.value);
}


let players = ['Dave', 'Joe'];

const jeoPage = <div className="App">
<div className="test">
<p>"JEOPARDY BOARD"</p>
{/* <p>Please select a category!</p>
<input type='text'></input><input type='button' id='categoryButton' onlclick="" value='Select'></input> */}
<div id='jeoBoard'>
<table>
  <tbody>
  <tr>
    <th>Category 1</th>
    <th>Category 2</th>
    <th>Category 3</th>
    <th>Category 4</th>
    <th>Category 5</th>
    <th>Category 6</th>
  </tr>
  <tr>
    <td><p>{used}</p></td>
    <td><p id="row1col2">100</p></td>
    <td><p id="row1col3">100</p></td>
    <td><p id="row1col4">100</p></td>
    <td><p id="row1col5">100</p></td>
    <td><p id="row1col6">100</p></td>
  </tr>
  <tr>
    <td><p id="row2col1">200</p></td>
    <td><p id="row2col2">200</p></td>
    <td><p id="row2col3">200</p></td>
    <td><p id="row2col4">200</p></td>
    <td><p id="row2col5">200</p></td>
    <td><p id="row2col6">200</p></td>
  </tr>
  <tr>
    <td><p id="row3col1">300</p></td>
    <td><p id="row3col2">300</p></td>
    <td><p id="row3col3">300</p></td>
    <td><p id="row3col4">300</p></td>
    <td><p id="row3col5">300</p></td>
    <td><p id="row3col6">300</p></td>
  </tr>
  <tr>
    <td><p id="row4col1">400</p></td>
    <td><p id="row4col2">400</p></td>
    <td><p id="row4col3">400</p></td>
    <td><p id="row4col4">400</p></td>
    <td><p id="row4col5">400</p></td>
    <td><p id="row4col6">400</p></td>
  </tr>
  <tr>
    <td><p id="row5col1">500</p></td>
    <td><p id="row5col2">500</p></td>
    <td><p id="row5col3">500</p></td>
    <td><p id="row5col4">500</p></td>
    <td><p id="row5col5">500</p></td>
    <td><p id="row4col6">500</p></td>
  </tr>
  </tbody>
</table>
</div>
<div id="scoreboard">
  <p>Player totals</p>
    <ul>
      <li>Dave: {scores[0]}</li>
      <li>Joe: {scores[1]}</li>
    </ul>
</div>
<p>The selected Category is [category returned from wheel]. It's {players[currentPlayer]}'s turn to guess.</p>
<p>The question is : [The correct answer is 'answer'].</p>
<input type='text' value={guess} onChange={doChange}></input><input type='button' value='Submit' onClick={submitGuess}></input>
<p>{success}</p>
</div>
</div>

// root.render("<h1>Hi</h1>");
function test(){
  return("<h1>test</h1>");
}
// root.render(test());
// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }


// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function demo() {
//   console.log('Taking a break...');
//   await sleep(5000);
//   console.log('Two second later');
// }

// demo();
return (jeoPage);
}

root.render(
  <Main />
);
// await sleep(500);
// alert("Category selected: Category 4");

// alert("huh");
// when a user types text in the text box
// and presses the 'submit' button
// select and display a question from that category
// function jeopardyButton(){
//   alert("gather text from textinput");
//   const select = () => {
//     alert("Great Shot!");
//   }
//   return (<button onClick={select}>Select category!</button>);
// }
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
