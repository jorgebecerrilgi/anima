export class State {
    id;
    setBehaviour;
    removeBehaviour;
}

export const FSM = {
    startingState: null,
    curr: null,
    nexId: 0,
    states: new Map(),
    setStartingState: setStartingState,
    setCurrentState: setCurrentState,
    addState: addState,
    updateState: updateState,
    removeState: removeState,
    transitionTo: transitionTo,
    hasState: hasState,
    getState: getState,
    start: start,
    stop: stop
}

function setStartingState(id) {
    id = Number(id)
    if (!FSM.hasState(id)) return;
    FSM.startingState = FSM.getState(id);
}

function setCurrentState(state) {
    FSM.curr = state;
    state.setBehaviour();
}

function addState(state) {
    state.id = FSM.nexId++;
    FSM.states.set(state.id, state);
    if (FSM.startingState === null) {
        FSM.startingState = state;
    }
}

function updateState(state, id) {
    id = Number(id);
    if (!FSM.states.has(id)) return;
    state.id = id;
    FSM.states.set(id, state);
}

function removeState(state) {
    FSM.states.delete(state.id);
}

function transitionTo(id) {
    id = Number(id);
    if (!FSM.states.has(id)) return;
    FSM.curr.removeBehaviour();
    FSM.setCurrentState(FSM.states.get(id));
}

function hasState(id) {
    return FSM.states.has(Number(id));
}

function getState(id) {
    id = Number(id);
    return FSM.states.has(id) ? FSM.states.get(id) : null;
}

function start() {
    if (FSM.startingState === null) return;
    FSM.setCurrentState(FSM.startingState);
}

function stop() {
    if (FSM.curr === null) return;
    FSM.curr.removeBehaviour();
    FSM.curr = null;
}

console.log("%cFinite State Machine", "color: lime;", FSM);