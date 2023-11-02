let maxFingers = 4;
let remainders = true;

let maxDepth = 11;

// actions:
// 0: tap with left hand to left hand
// 1: tap with left hand to right hand
// 2: tap with right hand to left hand
// 3: tap with right hand to right hand
// n - 100: transfer n fingers from left hand to right hand
function minimax(state, currentPlayer, currentDepth) {
    if (isTerminal(state) || currentDepth === maxDepth) {
        return evaluate(state);
    }
    if (currentPlayer == 0) { // max
        let possibleActions = getActions(state, currentPlayer);
        let maxUtility = -1000;
        possibleActions.forEach(action => {
            let newState = performAction(state, currentPlayer, action)
            let resultUtility = minimax(newState, 1, currentDepth + 1)
            if (resultUtility > maxUtility) {
                maxUtility = resultUtility
            }
        });
        return maxUtility
    } else if (currentPlayer == 1) { // min
        let possibleActions = getActions(state, currentPlayer);
        let minUtility = 1000;
        possibleActions.forEach(action => {
            let newState = performAction(state, currentPlayer, action)
            let resultUtility = minimax(newState, 0, currentDepth + 1)
            if (resultUtility < minUtility) {
                minUtility = resultUtility
            }
        });
        return minUtility
    }
}

function getActions(state, currentPlayer) {
    // TODO: remove duplicates that result from hands on the same team having the same number of fingers
    // future consideration: order matters for alpha beta pruning
    let actions = [];
    /*for (let i = 0; i < 2; i++) {
        if (state[2 * currentPlayer + i] != 0) { // can't tap with an empty hand or onto an empty hand
            for (let j = 0; j < 2; j++) {
                if (state[2 * (1 - currentPlayer) + j] != 0) {
                    actions.push(2 * i + j);
                }
            }
        }
    }*/
    if (state[0] !== 0) {
        if (state[2] !== 0) {
            actions.push(0)
        }
        if (state[3] !== 0 && state[3] !== state[2]) {
            actions.push(1 + currentPlayer)
        }
    } if (state[1] !== 0 && state[1] !== state[0]) {
        if (state[2] !== 0) {
            actions.push(2 - currentPlayer)
        }
        if (state[3] !== 0 && state[3] !== state[2]) {
            actions.push(3)
        }
    }

    // By symmetry, we can assume that fingers will always be transferred in such a way to leave more on equal on the right hand
    let maxAllowedTransfer = Math.min(maxFingers - state[currentPlayer * 2 + 1], state[currentPlayer * 2])
    let minAllowedTransfer = Math.ceil((state[currentPlayer * 2] - state[currentPlayer * 2 + 1]) / 2)
    for (let i = minAllowedTransfer; i <= maxAllowedTransfer; i++) {
        // Transferring 0 fingers would be like skipping a move
        // Also, transferring the difference is like skipping a move
        // Both of these are banned
        if (i !== 0 && i !== state[currentPlayer * 2] - state[currentPlayer * 2 + 1]) {
            actions.push(i - 100);
        }
    }
    return actions;
}

function evaluate(state) {
    if (state[0] === 0 && state[1] === 0) {
        return -100;
    } else if (state[2] === 0 && state[3] === 0) {
        return 100;
    } else if (state[0] + state[1] === 1 && state[2] + state[3] > 1) {
        // bad to be stuck with just one finger
        return -50;
    } else if (state[2] + state[3] === 1 && state[0] + state[1] > 1) {
        return 50;
    } else {
        return 0;
    }
}

function isTerminal(state) {
    return (state[0] == 0 && state[1] == 0) || (state[2] == 0 && state[3] == 0)
}

function performAction(state, currentPlayer, action) {
    let stateCopy = state.slice()
    if (action >= 0) {
        stateCopy[2 * (1 - currentPlayer) + (action % 2)] += state[2 * currentPlayer + Math.floor(action / 2)];
        if (remainders) {
            stateCopy[2 * (1 - currentPlayer) + (action % 2)] = stateCopy[2 * (1 - currentPlayer) + (action % 2)] % (maxFingers + 1)
        } else if (stateCopy[2 * (1 - currentPlayer) + (action % 2)] > maxFingers) {
            stateCopy[2 * (1 - currentPlayer) + (action % 2)] = 0;
        }
    } else { // a transfer
        // subtract from hand with more fingers and add to hand with less fingers
        stateCopy[2 * currentPlayer] -= (action + 100);
        stateCopy[2 * currentPlayer + 1] += (action + 100);
    }
    return stateCopy;
}

function chooseAction(state) { // computer choosing action
    let possibleActions = getActions(state, 0);
    let maxUtility = -1000;
    let bestAction;
    possibleActions.forEach(action => {
        let newState = performAction(state, 0, action)
        let resultUtility = minimax(newState, 1, 0)
        console.log(action, resultUtility);
        if (resultUtility > maxUtility) {
            maxUtility = resultUtility
            bestAction = action
        }
    });
    return bestAction;
}