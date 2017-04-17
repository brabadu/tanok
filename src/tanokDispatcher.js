export const TanokDispatcher = function() {};

TanokDispatcher.prototype.collect = function () {
  return this.events.map((args) => [args[0], args[1].bind(this)]);
}

TanokDispatcher.prototype[Symbol.iterator] = function(){
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
