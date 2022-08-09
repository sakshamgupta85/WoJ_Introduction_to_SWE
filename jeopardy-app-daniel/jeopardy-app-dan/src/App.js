import React, { Component } from "react";
import { Button } from "react-bulma-components";
import { fromJS } from "immutable";


import "./App.scss";

const SERVER_ENDPOINT = "http://localhost:8666/";

const players = ["Tom", "Jerry"];

let been_set_up = false;

let USER_ID = "";
let CURR_CATEGORY = "CATEGORY";
let CURR_PLAYER = "tom";
// const [myguess, mysetGuess] = useState("");



async function getGame() {
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
      curr_question: null
    };
    this.createGame = this.createGame.bind(this);
    this.spinWheel = this.spinWheel.bind(this);
    this.submitGuess = this.submitGuess.bind(this);
    this.doChange = this.doChange.bind(this);
    // this.submitBatch = this.submitBatch.bind(this);
  }

  async createGame() {
    const res = await getGame();
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
    this.setState({
        board: board,
        wheel: 1,
        scores: null,
        players: players,
        turns_rem: null,
        submit_answer: null,
        guess: null,
        curr_question: null
    })
    
    console.log("resecived response");
    // const data = await res.json();
    // const pairs = data.pairs.map(x => [
    //   x[0],
    //   x[1],
    //   x[2],
    //   x[3],
    //   Math.round(x[3] * 4) / 4
    // ]);
    // this.setState({
    //   page: data.page,
    //   pairs: fromJS(pairs)
    // });
  }

  async spinWheel() {
      console.log("huh");

      const res = await spin(USER_ID);
      const to_use = await res.json();
      console.log("RESULT OF SPINNING");
      console.log(to_use);
      const board = to_use.board;
      const players = to_use.players;
      const quest = to_use.curr_q;
      this.setState({
        board: board,
        wheel: null,
        scores: null,
        players: players,
        turns_rem: null,
        submit_answer: 1,
        guess: null,
        curr_question: quest
    })

    
    
    // const res = await postBatch(payload);
    // const data = await res.json();
    // console.log(data);
    // alert(`Submit Success: ${data.success} ${data.message}`);
  }

doChange(event){
    this.state.guess = event.target.value;
}


  async submitGuess() {
      console.log("from the text field: ", this.state.guess);
    const res = await guess(USER_ID, this.state.guess);
    const to_use = await res.json();
    console.log("RESULT OF SPINNING");
    console.log(to_use);
    const board = to_use.board;
    const players = to_use.players;
    this.setState({
      board: board,
      wheel: null,
      scores: null,
      players: players,
      turns_rem: null,
      submit_answer: 1,
      guess: null
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
                <p>[Player names form goes here]</p>
            )}

            <br></br>
            {been_set_up ? (
                ""
            ) : (
                <Button color="primary" onClick={this.createGame}>
                Play!
              </Button>
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