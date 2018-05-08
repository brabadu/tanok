import React from 'react';
import ReactDOM from 'react-dom';

import { Root } from './components/root';
import { createStore } from './createStore';

export function tanok(initialState, update, view, options) {
  let container = options.container;
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
  }
  const [tanokStream, store] = createStore(initialState, update, options);

  let component;
  const render = () => {
    const createdView = React.createElement(
      view, {
        tanokStream,
        ...store.getState(),
      });
    component = ReactDOM.render(
      <Root store={store} tanokStream={tanokStream}>
        {createdView}
      </Root>,
      container
    );
  };
  render();
  const sub = store.subscribe(render);

  return {
    component,
    tanokStream,
    store,
    shutdown: () => {
      sub();
      store.shutdown();
      container && ReactDOM.unmountComponentAtNode(container);
    },
  };
}
