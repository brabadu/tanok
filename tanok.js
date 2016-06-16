import Rx from 'rx';
import React from 'react';
import ReactDOM from 'react-dom';
import { StreamWrapper, dispatch } from './streamWrapper.js';
import { on } from './decorators';

const identity = (value) => value;

export function tanok(initialState, update, view, options) {
    let { container, outerEventStream, stateSerializer = identity } = options || {};
    if (!container) {
        container = document.createElement('div');
        document.body.appendChild(container);
    }

    const eventStream = new Rx.Subject();
    const rootParent = null;
    let dispatcher = dispatch(eventStream, update, rootParent);

    if (outerEventStream) {
        dispatcher = Rx.Observable.merge(
            dispatcher,
            dispatch(outerEventStream, update, rootParent)
        );
    }
    const streamWrapper = new StreamWrapper(eventStream, rootParent);

    const disposable = dispatcher
        .scan((([state, _], action) => action(state)), [initialState])
        .startWith([initialState])
        .do(([state]) => ReactDOM.render(
            React.createElement(
                view,
                {...stateSerializer(state), eventStream: streamWrapper}
            ),
            container
        ))
        .flatMap(([_, ...effects]) => Rx.Observable.merge(effects.map((e) => e(streamWrapper))))
        .subscribe(
            Rx.helpers.noop,
            console.error.bind(console)
        );

    streamWrapper.send('init');

    return { disposable, eventStream };
}

export function effectWrapper(effect, parent) {
    return ({ stream }) => {
        return effect
            ? effect(new StreamWrapper(stream, parent))
            : Rx.helpers.noop;
    };
}

/**
* Usage example:
* class HelloWorldDispatcher extends TanokDispatcher {
*
*   @on('helloEvent')
*   helloWorld (eventPayload, state) {
*       state.word = eventPayload.word;
*       return [state, helloWorldEffect];
*   }
* }
*
* var helloWorldDispatcher = new HelloWorldDispatcher();
* tanok(HelloWorldModel, helloWorldDispatcher.collect(), ViewComponent, {container})
* */
export class TanokDispatcher {
    collect() {
        return this.events.map(([predicate, stateMutator]) => [predicate, stateMutator.bind(this)]);
    }
}

export {
    tanok as default,
    on,
};
