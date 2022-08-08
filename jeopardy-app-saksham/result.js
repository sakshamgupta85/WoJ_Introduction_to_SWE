window.addEventListener('load', () => {
    
    const player1 = sessionStorage.getItem('PLAYER1');
    const player2 = sessionStorage.getItem('PLAYER2');
    
    document.getElementById('result-player1').innerHTML = player1;
    document.getElementById('result-player2').innerHTML = player2;

})