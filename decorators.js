import l from 'lodash';

/**
 * Decorator used with TanokDispatcher
 *
 * Usage example:
 *
 * class HelloWorldDispatcher extends TanokDispatcher {
 *
 *   @on('helloEvent')
 *   helloWorld (eventPayload, state) {
 *       state.word = eventPayload.word;
 *       return [state, helloWorldEffect];
 *   }
 * }
 *
 * @param predicate - action title or multiple values like @on('actionTitle', debounce(500))
 * @returns {Function}
 */
export function on(...predicate) {
    return (target, property) => {
        target.events = target.events || [];
        target.events.push([predicate, target[property]]);
    };
}


/**
 *
 * Analytic decorator usage example:
 *
 * import {analytic, on, TanokDispatcher} from "tanok";
 *
 * const myEventAnalyticHandler = (eventPayload, oldState, newState) => {
 *     tracker.trackEvent(eventPayload.category, oldState.action, newState.label);
 * }
 *
 * class YourAppDispatcher extends TanokDispatcher {
 *
 *    @on('myEvent')
 *    @analytic(myEventAnalyticHandler)
 *    myEvent (payload, state) => {
 *        ....do something...
 *        return [state, wowEffect];
 *    }
 * }
 *
 * */
export function analytic(analyticHandler) {
    return (target, property) => {
        const stateMutator = target[property];
        const wrappedFunc = (payload, state) => {
            const oldState = l.cloneDeep(state);
            const [newState, ...effect] = stateMutator(payload, state);
            analyticHandler(payload, oldState, newState);
            return [newState, ...effect];
        };
        target[property] = wrappedFunc;
    };
}
