let getEle = document.getElementsByClassName.bind(document);
let pointer = getEle('pointer')[0];
let result = getEle('result')[0];
let onRotation = false;
let options = ["Jeopardy 1", "Jeopardy 2", "Jeopardy 3", "Jeopardy 4", "Jeopardy 5", "Jeopardy 6",
"Jeopardy 1", "Jeopardy 2", "Jeopardy 3", "Jeopardy 4", "Jeopardy 5", "Jeopardy 6", 
"Lose turn", "Free turn", "Bankrupt", "Player's choice", "Opponent's choice", "Spin again"];

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

pointer.addEventListener('click', () => {
    if(onRotation) return;
    console.log("Spin starts");
    onRotation = true;
    let nextStatus = getOptions();
    console.log(nextStatus);
    result.innerText = "Result: " + nextStatus.text;
    result.style.display = 'block';
    pointer.style.transform = `rotateZ(${nextStatus.deg}deg)`;
});

pointer.addEventListener('transitioned', () => {
    console.log("Spin stops");
    setTimeout(() => {
        onRotation = false;
        result.style.display = 'block';
    }, 300);
});