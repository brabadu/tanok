import React from 'react';

import { createStore } from './createStore';
import { Root } from "./components/root";


export class TanokInReact extends React.Component {
  constructor(props) {
    super(props);
    const {
       initialState, update, view,
       middlewares = [],
       onNewState, outerEventStream
    } = props;

    const [tanokStream, store] = createStore(initialState, update, {
      middlewares,
      outerEventStream,
    });
    if (onNewState) {
      this.storeSub = store.subscribe(onNewState);
    }
    this.view = view;
    this.tanokStream = tanokStream;
    this.store = store;

  }

  componentWillUnmount() {
    this.storeSub && this.storeSub();
    this.store.shutdown();
  }

  render() {
    return (
      <Root store={this.store} tanokStream={this.tanokStream}>
          <this.view />
      </Root>
    )
  }
}
