import React from 'react';
import ReactDOM from 'react-dom';

import Root from './components/root';
import { createStore } from './createStore';

export function tanok(initialState, update, view, options) {
  let container = options.container;
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
  }
  const [tanokStream, store] = createStore(initialState, update, options);

  const createdView = React.createElement(view);
  const component = ReactDOM.render(
    <Root store={store} tanokStream={tanokStream}>
      {createdView}
    </Root>,
    container
  );

  return {
    component,
    tanokStream,
    store,
    shutdown: () => {
      store.shutdown();
      ReactDOM.unmountComponentAtNode(container);
    },
  };
}
