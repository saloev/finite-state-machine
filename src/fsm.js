class FSM {
  /**
   * Creates new FSM instance.
   * @param config
   */
  constructor(config) {
    if (!config) {
      throw Error("config is required");
    }
    this.config = config;
    this.state = config.initial;
    this.previousStates = [null];
    this.nextStates = [null];

    this.undoIndex = 0;
  }

  /**
   * Returns active state.
   * @returns {String}
   */
  getState() {
    return this.state;
  }

  /**
   * Goes to specified state.
   * @param state
   */
  changeState(state) {
    if (!state) throw Error("initial state is required for changeState setter");

    const isStateInConfig = Object.keys(this.config.states).some(
      key => key === state
    );

    if (!isStateInConfig)
      throw Error(`state: ${state} is not specified in config states`);

    this.previousStates.push(this.state);
    this.state = state;
    this.nextStates.push(this.state);

    this.undoIndex = this.previousStates.length - 1;
  }

  /**
   * Changes state according to event transition rules.
   * @param event
   */
  trigger(event) {
    const states = this.config.states[this.state].transitions;
    if (!states[event])
      throw Error(`Event: ${event} is not specified in config`);

    this.previousStates.push(this.state);
    this.state = states[event];
    this.nextStates.push(this.state);

    this.undoIndex = this.previousStates.length - 1;
  }

  /**
   * Resets FSM state to initial.
   */
  reset() {
    this.state = "normal";
  }

  /**
   * Returns an array of states for which there are specified event transition rules.
   * Returns all states if argument is undefined.
   * @param event
   * @returns {Array}
   */
  getStates(event) {
    const states = this.config.states;

    if (event === undefined) return Object.keys(states);
    return Object.keys(states).reduce((acc, key) => {
      const transition = states[key].transitions;

      return [...acc, ...(transition[event] ? [key] : [])];
    }, []);
  }

  /**
   * Goes back to previous state.
   * Returns false if undo is not available.
   * @returns {Boolean}
   */
  undo() {
    const lastState = this.previousStates[this.undoIndex];
    this.undoIndex -= 1;

    if (!lastState) return false;

    this.state = lastState;
    return true;
  }

  /**
   * Goes redo to state.
   * Returns false if redo is not available.
   * @returns {Boolean}
   */
  redo() {
    const nextStates = this.nextStates[this.undoIndex + 1];

    if (!nextStates) return false;

    this.undoIndex += 1;

    this.state = nextStates;

    return true;
  }

  /**
   * Clears transition history
   */
  clearHistory() {
    this.nextStates = [null];
    this.previousStates = [null];
  }
}

module.exports = FSM;

/** @Created by Uladzimir Halushka **/
