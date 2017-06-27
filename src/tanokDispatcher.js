export const TanokDispatcher = function() {};

TanokDispatcher.prototype.collect = function () {
  return Object.keys(this.events).map(
    (handlerFuncName) => {
        const pair = this.events[handlerFuncName];
        return [pair[0], pair[1].bind(this)];
    }
  );
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
    target.events = target.events || {};
    const handlerFunc = target[property];
    target.events[handlerFunc.name] = [predicate, handlerFunc];
  };
}
