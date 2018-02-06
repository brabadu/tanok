import { StreamWrapper, StateMutatorInterface } from './streamWrapper';
import { PredicateReturnType, PredicateInterface } from './helpers'

type PredicatesArrayInterface = Array<string | PredicateInterface>;

export class TanokDispatcher {
  events: [
    string,
    [PredicatesArrayInterface, StateMutatorInterface]
  ];

  collect() {
    return Object.keys(this.events).map(
      (handlerFuncName) => {
          const [predicate, handler] = this.events[handlerFuncName];
          return [predicate, handler.bind(this)];
      }
    );
  }

  [Symbol.iterator]() {
    function makeIterator(array){
      var nextIndex = 0;
      return {
         next: function(){
             return nextIndex < array.length ?
                 {value: array[nextIndex++], done: false} :
                 {done: true};
         }
      };
    }
    return makeIterator(this.collect());
  }
}

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
export function on(...predicate: PredicatesArrayInterface): ({events: object}, string) => void {
  return (target, property) => {
    target.events = target.events || {};
    const handlerFunc = target[property];
    target.events[property] = [predicate, handlerFunc];
  };
}
