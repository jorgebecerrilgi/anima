export class State {
    id;
    setBehaviour;
    removeBehaviour;
}

export const FSM = {
    curr: null,
    nexId: 0,
    states: new Map(),
    setCurrentState: setCurrentState,
    addState: addState,
    updateState: updateState,
    removeState: removeState,
    transitionTo: transitionTo,
    hasState: hasState
}

function setCurrentState(state) {
    FSM.curr = state;
    state.setBehaviour();
}

function addState(state) {
    state.id = FSM.nexId++;
    FSM.states.set(state.id, state);
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