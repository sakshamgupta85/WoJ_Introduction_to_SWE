let getEle = document.getElementsByClassName.bind(document);
let pointer = getEle('pointer')[0];
let result = getEle('result')[0];
let whoseturn = getEle('whoseturn')[0];
let resetButton = getEle("reset")[0];
console.log(resetButton);
let onRotation = false;
let player1Name = "Dave";
let player2Name = "Joe";
let player1 = true;
let options = ["Jeopardy 1", "Jeopardy 2", "Jeopardy 3", "Jeopardy 4", "Jeopardy 5", "Jeopardy 6",
"Jeopardy 1", "Jeopardy 2", "Jeopardy 3", "Jeopardy 4", "Jeopardy 5", "Jeopardy 6", 
"Lose turn", "Free turn", "Bankrupt", "Player's choice", "Opponent's choice", "Spin again"];

let getWhoseTurn = function(){
    if (player1){
        whoseturn.innerText = "It is " + player1Name +"'s turn";
    }else{
        whoseturn.innerText = "It is " + player2Name +"'s turn";
    }
};

getWhoseTurn();

let getOptions = (function(){
    currentDegree = 0;
    return function(){
        let rotatationDegree = Math.random() * 360 + 1080;
        currentDegree += rotatationDegree;
        let option = options[Math.floor(currentDegree % 360 / 20)];
        return{
            deg : currentDegree,
            text : option
        }
    }
})();

let checkJepordy = function(option){
    for(let i = 0; i <= 11; i++){
        if (option === options[i]){
            return true;
        }
    }
    return false;
}

pointer.onclick = function(){
    if(onRotation) return;
    console.log("Spin starts");
    onRotation = true;
    let nextStatus = getOptions();
    console.log(checkJepordy(nextStatus));
    if(checkJepordy(nextStatus.text)){
        location.href = "result.html"
    }
    // while (nextStatus.text == options[15]){
    //     pointer.onclick();
    // }

    result.innerText = "Result: " + nextStatus.text;
    result.style.display = 'block';
    pointer.style.transform = `rotateZ(${nextStatus.deg}deg)`;
};

pointer.addEventListener('transitioned', () => {
    console.log("Spin stops");
    setTimeout(() => {
        onRotation = false;
        result.style.display = 'block';
    }, 300);
});

resetButton.onclick = function(){
    if(player1){
        player1 = false;
        getWhoseTurn();
        reset();
    }else{
        player1 = true;
        getWhoseTurn();
        reset();
    }
};

let reset = function(){
    
    result.innerText = "";
    // setTimeout(() => {
    //     pointer.onclick();
    // }, 5000);
};
