import React, { Component } from "react";
import { Button } from "react-bulma-components";
import { fromJS } from "immutable";


import "./App.scss";

const SERVER_ENDPOINT = "http://localhost:8666/";

let been_set_up = false;

let USER_ID = "";
let CURR_CATEGORY = "CATEGORY";
let CURR_PLAYER = "";
let GAME_PLAYERS = [];

let wheelHTML = ""

async function getGame(players) {
    console.log("calling get game");
  const res = await fetch(SERVER_ENDPOINT + "setup/", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    body: JSON.stringify(players)
  });
  console.log("made it!")
  console.log(res);
  if (!res.ok) {
    throw Error(res.statusText);
  }
  return res;
}

async function spin(uid) {
  const res = await fetch(SERVER_ENDPOINT + "spin/", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    body: JSON.stringify(uid)
  });
  if (!res.ok) {
    throw Error(res.statusText);
  }
  return res;
}

async function guess(uid, guess) {
    const res = await fetch(SERVER_ENDPOINT + "guess/", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify([uid, guess])
      });
      if (!res.ok) {
        throw Error(res.statusText);
      }
      return res;
}

async function lose_a_turn(uid, token_lost) {
    const res = await fetch(SERVER_ENDPOINT + "lose_a_turn/", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify([uid, token_lost])
      });
      if (!res.ok) {
        throw Error(res.statusText);
      }
      return res;
}


async function pick_category(uid, column) {
    const res = await fetch(SERVER_ENDPOINT + "pick_category/", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify([uid, column])
      });
      if (!res.ok) {
        throw Error(res.statusText);
      }
      return res;
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      board: null,
      wheel: null,
      scores: null,
      players: null,
      turns_rem: null,
      submit_answer: null,
      guess: null,
      curr_question: null,
      scores:null,
      player_names:null,
      non_q_category: false,
      category_choice: false,
      picking_player: null,
      picked_category: null
    };
    this.createGame = this.createGame.bind(this);
    this.spinWheel = this.spinWheel.bind(this);
    this.submitGuess = this.submitGuess.bind(this);
    this.doChange = this.doChange.bind(this);
    this.set_player_names = this.set_player_names.bind(this);
    this.get_cat = this.get_cat.bind(this);
    this.chooseCategory = this.chooseCategory.bind(this);
    this.lose_a_turn = this.lose_a_turn.bind(this);
    this.lose_a_token = this.lose_a_token.bind(this);
    // this.submitBatch = this.submitBatch.bind(this);
  }

  validate_names(names) {
      let names_split = names.split(" ")
      return (names_split.length === 2) && (names_split[0] != names_split[1])
  }

  async createGame() {
    // need to get the inputted player names
    // could probably do a check on the input to make sure it isnt malicious
    console.log("NAMES : ", this.state.player_names)
    let potential_player_names = this.state.player_names
    if (!this.validate_names(potential_player_names)) {
        alert("Please enter only two different names, separated by a space.");
        return 0;
    }
    GAME_PLAYERS = potential_player_names.split(" ")

    const res = await getGame(this.state.player_names);
    const to_use = await res.json();
    console.log("got response");
    console.log(to_use)
    console.log(to_use.board);
    const board = to_use.board;
    const players = to_use.players;
    CURR_PLAYER = to_use.cp;
    USER_ID = to_use.uid;
    console.log(players);
    // ideally, the board, the players, everything else
    // will get parsed out of this response from the backend
    // this.state.board = 1;
    been_set_up = true;
    const scores = to_use.scores;
    const rem = to_use.spins_rem;
    this.setState({
        board: board,
        wheel: 1,
        scores: null,
        players: players,
        turns_rem: rem,
        submit_answer: null,
        guess: null,
        curr_question: null,
        scores:scores
    })
    
  }

  async spinWheel() {

      const res = await spin(USER_ID);
      const to_use = await res.json();
      if (to_use.game_over) {
        console.log("~~~~~~~~~~~~~~~~~~~~~~");
        console.log(to_use);
        console.log(to_use.winner);
        alert("Game over!! Congratulations to : " + to_use.winner);
      }
      else if (to_use.round_over) {
          // we've got a new board, and we're ready for the first spin
          // i dont care if you were in the middle of answering a question the round is over
          // we reached 0 spins left 
        const board = to_use.board;
        const players = to_use.players;
        const rem = to_use.spins_rem;
        const scores = to_use.scores;
        CURR_CATEGORY = to_use.cat;
        CURR_PLAYER = to_use.cp;
          this.setState({
            board: board,
            wheel: 1,
            players: players,
            turns_rem: rem,
            submit_answer: null,
            guess: null,
            curr_question: null,
            scores:scores,
            non_q_category: null,
            category_choice: null,
            lost_turn:null
        })

      } else {
        const board = to_use.board;
        const players = to_use.players;
        const quest = to_use.curr_q;
        const scores = to_use.scores;
        CURR_CATEGORY = to_use.cat;
        CURR_PLAYER = to_use.cp;
        if (
            CURR_CATEGORY === "Opponent Choice" || 
            CURR_CATEGORY === "Player Choice") {
          // we need to solicit user input to pick a category
          // UGH
          const rem = to_use.spins_rem;
          let picking_player = "";
          if (CURR_CATEGORY === "Player Choice") {
              picking_player = CURR_PLAYER;
          } else {
              // get the other player, not the current one (this is inelegant)
              if (CURR_PLAYER === GAME_PLAYERS[0]) {
                  picking_player = GAME_PLAYERS[1];
              } else {
                  picking_player = GAME_PLAYERS[0];
              }
          }
          
          this.setState({
              board: board,
              wheel: null,
              players: players,
              turns_rem: rem,
              submit_answer: null,
              guess: null,
              curr_question: null,
              scores:scores,
              non_q_category: false,
              category_choice: true,
              picking_player: picking_player
          })
        }
        else if (
            CURR_CATEGORY === "Bankrupt" || 
            CURR_CATEGORY === "Spin Again" ||
            CURR_CATEGORY === "Free Turn" ||
            CURR_CATEGORY === "Lose a Turn") {
          // these spin results all get rendered the same way
          const rem = to_use.spins_rem;
          console.log("non question cat");
          if (CURR_CATEGORY === "Lose a Turn") {
              if (to_use.status === 'no_tokens') {
                  // set the state of the board to say, turn lost and no tokens
                  this.setState({
                      // board: board,
                      // wheel: 1,
                      // players: players,
                      turns_rem: rem,
                      submit_answer: null,
                      guess: null,
                      curr_question: null,
                      // scores:scores,
                      non_q_category: false,
                      category_choice: false,
                      lost_turn:true
                  }
                  
                  )
              } else {
                  //set the state of the board to sy "turn lost, use a token?"
                  this.setState({
                      // board: board,
                      // wheel: 1,
                      // players: players,
                      wheel:null,
                      turns_rem: rem,
                      submit_answer: null,
                      guess: null,
                      curr_question: null,
                      // scores:scores,
                      non_q_category: false,
                      category_choice: false,
                      lost_turn:null,
                      losing_turn:true
                  })
              }
          } else {
              this.setState({
                  board: board,
                  wheel: 1,
                  players: players,
                  turns_rem: rem,
                  submit_answer: null,
                  guess: null,
                  curr_question: null,
                  scores:scores,
                  non_q_category: true,
                  category_choice: false,
                  lost_turn:null
              })
          }
          
        } else {
          // the cateogry must have been a question category so just render the page that way
          const rem = to_use.spins_rem;
          this.setState({
          board: board,
          wheel: null,
          scores: null,
          players: players,
          turns_rem: rem,
          submit_answer: 1,
          guess: null,
          curr_question: quest,
          scores:scores,
          non_q_category: false,
          category_choice: false,
          lost_turn:null
          })
        }
      }
      console.log("RESULT OF SPINNING");
      console.log(to_use);
      
  }

doChange(event){
    this.state.guess = event.target.value;
}

set_player_names(event) {
    this.state.player_names = event.target.value;
}

get_cat(event) {
    console.log(event);
    this.state.picked_category = event.target.value;
}

  async submitGuess() {
    console.log("from the text field: ", this.state.guess);
    const res = await guess(USER_ID, this.state.guess);
    const to_use = await res.json();
    console.log("RESULT OF SPINNING");
    console.log(to_use);
    
    const board = to_use.board;
    const players = to_use.players;
    const scores = to_use.scores;
    const rem = to_use.spins_rem;
    CURR_PLAYER = to_use.cp;
    this.setState({
      board: board,
      wheel: 1,
      scores: null,
      players: players,
      turns_rem: rem,
      submit_answer: null,
      guess: null,
      scores:scores,
      lost_turn:null
  })
  
  }

  async chooseCategory() {
    console.log("from the text field: ", this.state.picked_category);
    let choice = this.state.picked_category;
    if (choice < 1 || choice > 6) {
        alert("Please enter a number corresponding to the selected column, 1-6.");
        this.state.picked_category = null;
        return 1;
    }
    // inout was maybe valid, send a request to the backend endpoint for player selection
    // make sure the selected category actually has questions left lol
    const res = await pick_category(USER_ID, choice);
    const to_use = await res.json();
    console.log("RESULT OF picking");
    console.log(to_use);
    if (!to_use.success) {
        alert("Something went wrong, please select a category that has questions remaining.");
        this.state.picked_category = null;
        return 1;
    }
    // we know the selected category was valid, so display the selected question with the right player guessing
    const rem = to_use.spins_rem;
    CURR_CATEGORY = to_use.cat;
        this.setState({
            board: to_use.board,
            wheel: null,
            scores: null,
            players: to_use.players,
            turns_rem: rem,
            submit_answer: 1,
            guess: null,
            curr_question: to_use.curr_q,
            scores:to_use.scores,
            non_q_category: false,
            category_choice: false,
            picked_category: null,
            lost_turn:null
        })

}


async lose_a_token(){
    // send a request to the backend, we'll lose the token
    let token_lost = 1;
    const res = await lose_a_turn(USER_ID, token_lost);
    const to_use = await res.json();
    CURR_PLAYER = to_use.cp;
    this.setState({
        losing_turn:null,
        wheel: 1,
        
    })
}

async lose_a_turn(){
    // send a request to the backend, we'll lose the turn
    let token_lost = 0;
    const res = await lose_a_turn(USER_ID, token_lost);
    const to_use = await res.json();
    CURR_PLAYER = to_use.cp;
    this.setState({
        losing_turn:null,
        wheel: 1,
        lost_turn:true
        
    })
}

//   changeScore = (i, score) => () => {
//     this.setState({
//       pairs: this.state.pairs.set(i, this.state.pairs.get(i).set(4, score))
//     });
//   };



  render() {
    return (
      <section className="section">
        <div className="container">
          <section className="section">
              
            {this.state.players !== null ? (
                
                <div dangerouslySetInnerHTML={{ __html: this.state.players }}>
                {/* {this.state.board} */}
            
                </div>
            ) : (
                <div id="landing_page">
                    <center> 
                    <img className="logo" src={require("./logo.png")} alt="Site Logo">
                    </img>
                    </center>
                    <body> 
                    <center> <h1>Welcome to the Wheel of Jeopardy!</h1>
                    <h2>
                        Please enter the names of players 1 and 2 here, separated by a single space:
                    </h2>
                    <input className="nameInput" type='text' value={this.state.players_input} onChange={this.set_player_names}></input>
                    <br></br>
                    <a href={require("./WheelOfJeopardy.pdf")}>Rulebook</a></center>

                    </body>
                
                </div>
            )}
            {this.state.turns_rem !== null ? (
                
                <div><p>Spins remaining : </p><div dangerouslySetInnerHTML={{ __html: this.state.turns_rem }}></div>
                {/* {this.state.board} */}
            
                </div>
            ) : (
                ""
            )}
            <br></br>
            {been_set_up ? (
                ""
            ) : (
                <div>
                    <center>
                        <Button color="primary" onClick={this.createGame}>
                            Play!
                        </Button>
                    </center>
              </div>
            )}
            {this.state.scores !== null ? (
              <div dangerouslySetInnerHTML={{ __html: this.state.scores }}>
                  {/* {this.state.board} */}
              
            </div>
            ) : (
              ""
            )}
            {this.state.board !== null ? (
              <div dangerouslySetInnerHTML={{ __html: this.state.board }}>
                  {/* {this.state.board} */}
              
            </div>
            ) : (
              ""
            )}
            {this.state.wheel !== null ? (
              <React.Fragment>
                <div>
                 
                    <p> It's {CURR_PLAYER}'s turn to spin.</p>
                    <br></br>
                    
                    <Button color="primary" onClick={this.spinWheel}>
                    Spin!
                    </Button>
                    
                    
                    <p className="wrapper">
                      <p className="panel">
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category A</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category B</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category C</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category D</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category E</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category F</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category A</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category B</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category C</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category D</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category E</span>
                              </p>
                          </p>

                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category F</span>
                              </p>
                          </p>

                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Lose a turn</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Free turn</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Bankrupt</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Player's choice</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Opponent's choice</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Spin again</span>
                              </p>
                          </p>
                        <p className="pointer"></p>
                      </p>
                    </p>
                                 
              </div>
              </React.Fragment>
            ) : (
              ""
            )}
            {this.state.non_q_category ? (
              <p>The selected Category is {CURR_CATEGORY}. It's {CURR_PLAYER}'s turn to spin.</p>
              
            ) : (
              ""
            )}
            {this.state.losing_turn ? (
              <div>
                <p>You landed on 'Lose a Turn!' Would you like to use a token?</p>
                <Button color="primary" onClick={this.lose_a_token}>
                Yes
                </Button>
                <Button color="secondary" onClick={this.lose_a_turn}>
                No
                </Button>
              </div>
            ) : (
              ""
            )

            }
            {this.state.lost_turn ? (
              <p>You lost a turn! It's {CURR_PLAYER}'s turn to spin.</p>
            ) : (
              ""
            )}
            {this.state.category_choice ? (
              <React.Fragment>
                <div> 
                    <p>The selected Category is {CURR_CATEGORY}. The player that gets to pick is {this.state.picking_player}.</p>
                    <p>Please pick a column number, 1-6.</p>


                    <p className="wrapper">
                      <p className="panel">
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category A</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category B</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category C</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category D</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category E</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category F</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category A</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category B</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category C</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category D</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category E</span>
                              </p>
                          </p>

                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category F</span>
                              </p>
                          </p>

                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Lose a turn</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Free turn</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Bankrupt</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Player's choice</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Opponent's choice</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Spin again</span>
                              </p>
                          </p>
                        <p className="pointer"></p>
                      </p>
                    </p>

                    <input type='text' value={this.state.picked_category} onChange={this.get_cat}></input>
                    <Button onClick={this.chooseCategory}>
                    Choose category
                    </Button>

                </div>
                </React.Fragment>

            ) : (
              ""
            )}
            {this.state.submit_answer !== null ? (
                <div>
                
            <p>The selected Category is {CURR_CATEGORY}. It's {CURR_PLAYER}'s turn to guess.</p>
            <br></br>
            <p>The question is : {this.state.curr_question}.</p>
            <br></br>
            <input type='text' value={this.state.guess} onChange={this.doChange}></input>
            <br></br>
              <Button color="primary" onClick={this.submitGuess}>
              Submit!
            </Button>

            <p className="wrapper">
                      <p className="panel">
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category A</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category B</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category C</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category D</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category E</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category F</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category A</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category B</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category C</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category D</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category E</span>
                              </p>
                          </p>

                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Category F</span>
                              </p>
                          </p>

                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Lose a turn</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Free turn</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Bankrupt</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Player's choice</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Opponent's choice</span>
                              </p>
                          </p>
                          <p className="sector">
                              <p className="sector-inner">
                                  <span>Spin again</span>
                              </p>
                          </p>
                        <p className="pointer"></p>
                      </p>
                    </p>
          
            </div>
            ) : (
              ""
            )}
            {/* {this.state.page !== null ? (
              <span className="subtitle">Page {this.state.page + 1}</span>
            ) : (
              ""
            )} */}
          </section>
          
        </div>
      </section>
    );
  }
}

export default App;