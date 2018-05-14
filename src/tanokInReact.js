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
      this.storeSubOnNewState = store.subscribe(onNewState);
    }
    this.view = view;
    this.tanokStream = tanokStream;
    this.store = store;
  }

  componentDidMount() {
    this.storeSubOnStoreUpd = this.store.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount() {
    this.storeSubOnNewState && this.storeSubOnNewState();
    this.storeSubOnStoreUpd();
    this.store.shutdown();
  }

  render() {
    return (
      <Root store={this.store} tanokStream={this.tanokStream}>
          <this.view tanokStream={this.tanokStream} {...this.store.getState()} />
      </Root>
    )
  }
}
