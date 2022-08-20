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
    this.set_player_names = this.set_player_names.bind(this)
    this.get_cat = this.get_cat.bind(this)
    this.chooseCategory = this.chooseCategory.bind(this)
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
      console.log("RESULT OF SPINNING");
      console.log(to_use);
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
                picking_player = GAME_PLAYERS[1];
            }
        }
        
        this.setState({
            board: board,
            wheel: null,
            scores: null,
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
        this.setState({
            board: board,
            wheel: 1,
            scores: null,
            players: players,
            turns_rem: rem,
            submit_answer: null,
            guess: null,
            curr_question: null,
            scores:scores,
            non_q_category: true,
            category_choice: false
        })
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
        category_choice: false
        })
      }
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
    this.setState({
      board: board,
      wheel: 1,
      scores: null,
      players: players,
      turns_rem: rem,
      submit_answer: null,
      guess: null,
      scores:scores
  })
  if (to_use.game_over) {
    console.log("~~~~~~~~~~~~~~~~~~~~~~");
    console.log(to_use);
    console.log(to_use.winner);
    alert("Game over!! Congratulations to : " + to_use.winner);
    }
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
            picked_category: null
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
                <div>
                <p>Enter names, separated by a space.</p>
                <input type='text' value={this.state.players_input} onChange={this.set_player_names}></input>
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
                <Button color="primary" onClick={this.createGame}>
                Play!
              </Button>
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
              <Button color="primary" onClick={this.spinWheel}>
              Spin!
            </Button>
            ) : (
              ""
            )}
            {this.state.non_q_category ? (
              <p>The selected Category is {CURR_CATEGORY}. It's {CURR_PLAYER}'s turn to spin.</p>
            ) : (
              ""
            )}
            {this.state.category_choice ? (
                <div>
                    <p>The selected Category is {CURR_CATEGORY}. The player that gets to pick is {this.state.picking_player}.</p>
                    <p>Please pick a column number, 1-6.</p>
                    <input type='text' value={this.state.picked_category} onChange={this.get_cat}></input>
                    <Button color="primary" onClick={this.chooseCategory}>
                    Choose category
                    </Button>
                </div>
            ) : (
              ""
            )}
            {this.state.submit_answer !== null ? (
                <div>
            <p>The selected Category is {CURR_CATEGORY}. It's {CURR_PLAYER}'s turn to guess.</p>
            <p>The question is : {this.state.curr_question}.</p>
            <input type='text' value={this.state.guess} onChange={this.doChange}></input>
              <Button color="primary" onClick={this.submitGuess}>
              Submit!
            </Button>
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