import Rx from 'rx';
import PropTypes from 'prop-types';
import React from 'react';

import { StreamWrapper } from './streamWrapper.js';
import { makeStreamState, streamWithEffects, identity } from './core.js';


export class TanokInReact extends React.Component {
  constructor(props) {
    super(props);
    const {
       initialState, update, view,
       stateSerializer = identity, middlewares = [],
       onNewState
    } = props;

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
        this._mounted && this.setState({ state: stateSerializer(state) });
        onNewState && onNewState(state);
      }
    );
    const renderedWithEffects = streamWithEffects(renderedStream, streamWrapper);

    streamWrapper.disposable = renderedWithEffects.subscribe(
      Rx.helpers.noop,
      console.error.bind(console)
    );

    this.state = {
      view: view,
      shutdown: () => {
          streamWrapper.disposable.dispose();
      },

      tanokStream: streamWrapper,
      state: initialState,
    };

    streamWrapper.send('init');
  }

  getChildContext() {
    return { tanokStream: this.state.tanokStream }
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
      Object.assign(state.state, {
          tanokStream: state.tanokStream
      }),
    )
  }
}

TanokInReact.childContextTypes = {
  tanokStream: PropTypes.instanceOf(StreamWrapper).isRequired,
};
