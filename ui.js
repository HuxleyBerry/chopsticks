let fingersList = [1, 1, 1, 1];
const imgList = ["0.png", "1.png", "2.png", "3.png", "4.png", "5.png"];
const posAdjustments = [[0, 0], [0, 0], [-1, -10], [-1, -9], [-10, -12], [-29, -5]];

let enemyMove;
let count = 0;

const escButton = document.getElementById("esc-button");
escButton.style.display = "none";
const dropdown = document.getElementById("dropdown");
dropdown.style.display = "none";
const dropdownContent = document.getElementById("dropdown-content");
const handElements = [0, 1, 2, 3].map(n => document.getElementById(`hand${n}`))

let enemyTurn = false;
let gameOver = false;

function drawHands(flist) {
    // indices 0 and 1 correspond to the computer's hands, 2 and 3 correspond to the player's hands

    handElements[0].src = imgList[flist[0]]
    handElements[0].style.left = 100 + posAdjustments[flist[0]][0] + "px";
    handElements[0].style.top = 100 - posAdjustments[flist[0]][1] + "px";
    handElements[0].style.transform = "scale(1,-1)";

    handElements[1].src = imgList[flist[1]]
    handElements[1].style.left = 300 - posAdjustments[flist[1]][0] + "px";
    handElements[1].style.top = 100 - posAdjustments[flist[1]][1] + "px";
    handElements[1].style.transform = "scale(-1,-1)";

    handElements[2].src = imgList[flist[2]]
    handElements[2].style.left = 100 + posAdjustments[flist[2]][0] + "px";
    handElements[2].style.top = 500 + posAdjustments[flist[2]][1] + "px";

    handElements[3].src = imgList[flist[3]]
    handElements[3].style.left = 300 - posAdjustments[flist[3]][0] + "px";
    handElements[3].style.top = 500 + posAdjustments[flist[3]][1] + "px";
    handElements[3].style.transform = "scale(-1,1)";
};

drawHands(fingersList);

let selectedHand = -1;

function toggleButtonVisibility(show) {
    if (show) {
        escButton.style.display = "block";
        dropdown.style.display = "inline-block";
    } else {
        escButton.style.display = "none";
        dropdown.style.display = "none";
    }
}

function selectHand(event) {
    if (selectedHand == -1 && enemyTurn == false && !gameOver) {
        selectedHand = event.target == handElements[2] ? 0 : 1;
        makeTransferOptions();
        toggleButtonVisibility(true);
    }
}

function tapHand(event) {
    if (selectedHand == -1) { // if neither hand is selected to tap with, return
        return;
    }
    let tappedHandIndex = event.target == handElements[0] ? 0 : 1;
    if (handElements[tappedHandIndex] == 0) { // tapping empty hands does nothing
        return;
    }
    respondToGameStart();
    let action = selectedHand * 2 + tappedHandIndex;
    fingersList = performAction(fingersList, 1, action);
    completePlayerTurn();
}


function reset() {
    selectedHand = -1;
    toggleButtonVisibility(false);
    drawHands(fingersList);
}

function completePlayerTurn() {
    reset();
    if (fingersList[0] === 0 && fingersList[1] === 0) {
        endGame(1);
    } else {
        getEnemyTurn();
    }
}
function calcAllowedTransfers(sel, oth) {
    if (sel == 0) {
        return [];
    } else {
        var allowed = [];
        for (let i = 1; i <= sel; i++) {
            if (i != sel - oth && oth + i <= maxFingers) {
                allowed.push(i)
            }
        }
        return allowed;
    }
};

function transferFingers() {
    respondToGameStart();
    let transferAmount = this.innerHTML[0]
    let action = (1 - selectedHand * 2) * transferAmount - 100
    fingersList = performAction(fingersList, 1, action);
    completePlayerTurn();
};

function makeTransferOptions() {
    dropdownContent.innerHTML = "";
    if (selectedHand === 0) {
        var allowed = calcAllowedTransfers(fingersList[2], fingersList[3]);
    } else {
        var allowed = calcAllowedTransfers(fingersList[3], fingersList[2]);
    }
    for (let i = 0; i < allowed.length; i++) {
        let newOption = document.createElement("button")
        dropdownContent.appendChild(newOption);
        newOption.className = "transfer-button";
        newOption.addEventListener("click", transferFingers);
        if (allowed[i] == 1) {
            newOption.innerHTML = "1 finger";
        } else {
            newOption.innerHTML = `${allowed[i]} fingers`;
        }
    }
}

function mouseMoved(event) {
    if (selectedHand !== -1) {
        handElements[selectedHand + 2].style.left = event.clientX + "px";
        handElements[selectedHand + 2].style.top = event.clientY + "px";
    }
}

function getEnemyTurn() {
    enemyMove = chooseAction(fingersList);
    fingersList = performAction(fingersList, 0, enemyMove);
    enemyTurn = true;
};

function run() {
    if (enemyTurn) {
        if (count >= 20) {
            enemyTurn = false;
            count = 0;
            drawHands(fingersList);
            if (fingersList[2] === 0 && fingersList[3] === 0) {
                endGame(0);
            }
        } else if (enemyMove >= 0) { // enemyMove isn't a transfer
            let movingHandElement = handElements[Math.floor(enemyMove / 2)]
            let crossing = enemyMove === 1 ? 1 : (enemyMove === 2 ? -1 : 0);
            movingHandElement.style.top = parseFloat(movingHandElement.style.top) + 10 + "px";
            movingHandElement.style.left = parseFloat(movingHandElement.style.left) + 10 * crossing + "px";
        }
        count++;
    }
};
function toggleSettingAccess(allowAccess) {
    document.querySelectorAll('input[name="max-fingers"]').forEach(radioButton => {
        radioButton.disabled = allowAccess;
    })
    document.getElementById("remainders-checkbox").disabled = allowAccess;
    document.getElementById("depth-slider").disabled = allowAccess;
}


function endGame(winner) {
    gameOver = true;
    document.getElementById("play-again").textContent = "Play Again";
    if (winner === 0) {
        alert("YOU LOSE");
    } else {
        alert("YOU WIN!");
    }
}

function respondToGameStart() {
    toggleSettingAccess(true);
    document.getElementById("play-again").style.display = "block";
}

function restart() {
    count = 0;
    enemyTurn = false;
    gameOver = false;
    fingersList = [1, 1, 1, 1];
    document.getElementById("play-again").style.display = "none";
    document.getElementById("play-again").textContent = "Reset";
    toggleSettingAccess(false);
    drawHands(fingersList);
}

document.querySelectorAll('input[name="max-fingers"]').forEach(radioButton => {
    radioButton.onclick = () => {
        maxFingers = parseInt(radioButton.value);
    };
});
document.getElementById("remainders-checkbox").onclick = (event) => {
    remainders = event.target.checked;
};
document.getElementById("depth-slider").onchange = (event) => {
    event.target.nextElementSibling.textContent = event.target.value;
    maxDepth = parseInt(event.target.value);
}

handElements[0].onclick = tapHand;
handElements[1].onclick = tapHand;
handElements[2].onclick = selectHand;
handElements[3].onclick = selectHand;
window.addEventListener("mousemove", mouseMoved);
window.setInterval(run, 50);