class FSM {
    /**
     * Creates new FSM instance.
     * @param config
     */
    constructor(config) {
        if (!config) {
            throw new Error('Config isn\'t passed');
        }

        this[Symbol.for('config')] = config;
        this[Symbol.for('state stack')] = Array.of(config.initial);

        this[Symbol.for('state history')] = [];

        // Controls if redo functionalily is blocked
        this[Symbol.for('redo gate')] = false;
    }

    /**
     * Returns active state.
     * @returns {String}
     */
    getState() {
        // Lengthy, but the most efficient one
        return this[Symbol.for('state stack')][this[Symbol.for('state stack')].length - 1];
    }

    /**
     * Goes to specified state.
     * @param state
     */
    changeState(state) {
        if (!this[Symbol.for('config')].states.hasOwnProperty(state)) {
            throw new Error(`State ${state} isn't exist`);
        }

        this[Symbol.for('state stack')].push(state);
        this[Symbol.for('redo gate')] = true;
    }

    /**
     * Changes state according to event transition rules.
     * @param event
     */
    trigger(event) {
        if (!this[Symbol.for('config')].states[this.getState()].transitions.hasOwnProperty(event)) {
            throw new Error(`State ${event} isn't exist`);
        }

        // State stack push() line is too long without this temporary variable
        const state = this[Symbol.for('config')].states[this.getState()].transitions[event];

        this[Symbol.for('state stack')].push(state);
        this[Symbol.for('redo gate')] = true;
    }

    /**
     * Resets FSM state to initial.
     */
    reset() {
        this.changeState(this[Symbol.for('config')].initial);
    }

    /**
     * Returns an array of states for which there are specified event transition rules.
     * Returns all states if argument is undefined.
     * @param event
     * @returns {Array}
     */
    getStates(event) {
        if (!event) {
            return Object.keys(this[Symbol.for('config')].states);
        }

        let states = [];

        // var is a bit faster to use here
        for (var state in this[Symbol.for('config')].states) {
            if (this[Symbol.for('config')].states[state].transitions.hasOwnProperty(event)) {
                states.push(state);
            }
        }

        return states;
    }

    /**
     * Goes back to previous state.
     * Returns false if undo is not available.
     * @returns {Boolean}
     */
    undo() {
        if (this[Symbol.for('state stack')].length < 2) {
            return false;
        }

        this[Symbol.for('state history')].push(this[Symbol.for('state stack')].pop());
        this[Symbol.for('redo gate')] = false;

        return true;
    }

    /**
     * Goes redo to state.
     * Returns false if redo is not available.
     * @returns {Boolean}
     */
    redo() {
        if (this[Symbol.for('redo gate')] || !this[Symbol.for('state history')].length) {
            return false;
        }

        this[Symbol.for('state stack')].push(this[Symbol.for('state history')].pop());

        return true;
    }

    /**
     * Clears transition history
     */
    clearHistory() {
        this[Symbol.for('state history')] = [];

        // Set state to initial for consistency
        this[Symbol.for('state stack')] = Array.of(this[Symbol.for('config')].initial);
    }
}

module.exports = FSM;
