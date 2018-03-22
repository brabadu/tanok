export * from './component';
export * from './core';
export * from './constants';
export * from './fxs';
export * from './helpers';
export * from './tanokDispatcher';
export * from './tanokInReact';
export * from './connect/connect';
export * from './createStore';
export * from './components/root';
export * from './components/subcomponent';

import { childFx } from './fxs';

export function effectWrapper(effect, streamName, metadata = null) {
  console.error('`effectWrapper` is deprecated. Use `childFx` instead');
  return childFx(effect, streamName, metadata);
}
