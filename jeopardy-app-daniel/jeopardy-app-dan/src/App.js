import React, { Component } from "react";
import { Button } from "react-bulma-components";
import { fromJS } from "immutable";


import "./App.scss";

const SERVER_ENDPOINT = "http://localhost:8666/";

const players = ["Tom", "Jerry"];

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

async function postBatch(batch) {
  const res = await fetch(SERVER_ENDPOINT + "batch/", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    credentials: "include",
    body: JSON.stringify(batch)
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
      turns_rem: null
    };
    this.createGame = this.createGame.bind(this);
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
    console.log(players);
    // ideally, the board, the players, everything else
    // will get parsed out of this response from the backend
    // this.state.board = 1;
    this.setState({
        board: board,
        wheel: null,
        scores: null,
        players: players,
        turns_rem: null
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

  async submitBatch() {
      console.log("huh");
    // const payload = {
    //   page: this.state.page,
    //   pairs: this.state.pairs.map(x => [x.get(0), x.get(4)])
    // };
    // const res = await postBatch(payload);
    // const data = await res.json();
    // console.log(data);
    // alert(`Submit Success: ${data.success} ${data.message}`);
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
            <Button color="primary" onClick={this.createGame}>
              Play!
            </Button>
            {this.state.board !== null ? (
              <div dangerouslySetInnerHTML={{ __html: this.state.board }}>
                  {/* {this.state.board} */}
              
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