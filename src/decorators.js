/**
 * Decorator used with TanokDispatcher
 *
 * Usage example:
 *
 * class HelloWorldDispatcher extends TanokDispatcher {
 *
 *   @on('helloEvent')
 *   helloWorld (eventPayload, state) {
 *     state.word = eventPayload.word;
 *     return [state, helloWorldEffect];
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
