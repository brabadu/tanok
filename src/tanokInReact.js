import Rx from 'rx';
import React from 'react';

import { StreamWrapper } from './streamWrapper.js';
import { makeStreamState, streamWithEffects, identity } from './core.js';


export class TanokInReact extends React.Component {
  constructor(props) {
    super(props);
    const {
       initialState, update, view,
       stateSerializer = identity, middlewares = [],
       onNewState, outerEventStream
    } = props;
    this.stateSerializer = stateSerializer;

    const eventStream = new Rx.Subject();
    const streamWrapper = new StreamWrapper(eventStream, null);
    streamWrapper.metadata.push(null);

    const streamState = makeStreamState(
      Object.assign({}, initialState),
      update,
      eventStream,
      middlewares
    );

    const renderedStream = streamState.do(
      ({state}) => {
        this._mounted && this.setState({state});
        onNewState && onNewState(state);
      }
    );
    const renderedWithEffects = streamWithEffects(renderedStream, streamWrapper);

    streamWrapper.disposable = renderedWithEffects.subscribe(
      Rx.helpers.noop,
      console.error.bind(console)
    );
    let outerEventDisposable;
    if (outerEventStream) {
      outerEventDisposable = outerEventStream.subscribe(
        streamWrapper.stream.onNext.bind(streamWrapper.stream),
        console.error.bind(console)
      );
    }


    this.state = {
      view: view,
      shutdown: () => {
        streamWrapper.disposable.dispose();
        outerEventDisposable && outerEventDisposable.dispose();
      },

      tanokStream: streamWrapper,
      state: initialState,
    };

    streamWrapper.send('init');
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() {
    this.state.shutdown();
  }

  render() {
    const state = this.state;
    return React.createElement(
      state.view,
      Object.assign(
        this.stateSerializer(state.state), {
          tanokStream: state.tanokStream
      }),
    )
  }
}
