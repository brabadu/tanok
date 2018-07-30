
'use strict';

import Rx from '@evo/rx';
import React from 'react';
import expect from 'expect';
import sinon from 'sinon';

import { tanok, TanokDispatcher, on, connect, subcomponentFx, childFx } from '../src/tanok.js';
import { createStore } from '../src/createStore.js';


function initModel() {
  return {
    ping: false,
  }
};


class SubDisp extends TanokDispatcher {
  @on('ping')
  ping(payload, state) {
    return [true];
  }
}

class RootDisp extends TanokDispatcher {
  @on('init')
  init(_, state) {
    return [state, subcomponentFx('sub', new SubDisp)]
  }

  @on('sub')
  sub(payload, state) {
    const newState = payload(state.ping);
    return [{ ping: newState }];
  }
}


describe('one-level-subcomponents', () => {

  it('launch and send event to child', function (done) {
    const update = new RootDisp;
    const [tanokStream, store] = createStore(initModel(), update);
    const subStream = tanokStream.subWithMeta('sub');
    expect(store.getState().ping).toBeFalsy();
    subStream.send('ping');
    expect(store.getState().ping).toBeTruthy();

    store.shutdown();
    done();
  });

});


class RootTwoLevelDisp extends TanokDispatcher {
  @on('init')
  init(_, state) {
    return [
      state,
      subcomponentFx('root1', new RootDisp),
      subcomponentFx('root2', new RootDisp)
    ]
  }

  @on('root1')
  root1(payload, state) {
    const [newState, ...effects] = payload(state.root1);
    return [{ ...state, root1: newState }, ...effects.map(i => childFx(i, 'root1'))];
  }

  @on('root2')
  root2(payload, state) {
    const [newState, ...effects] = payload(state.root2);
    return [{ ...state, root2: newState }, ...effects.map(i => childFx(i, 'root2'))];
  }
}


describe('two-level-subcomponents', () => {

  it('launch and send event to child', function (done) {
    const update = new RootTwoLevelDisp;
    const [tanokStream, store] = createStore({
      root1: initModel(),
      root2: initModel(),
    }, update);
    const subStream = tanokStream.subWithMeta('root1').subWithMeta('sub');

    expect(store.getState().root1.ping).toBeFalsy();
    expect(store.getState().root2.ping).toBeFalsy();
    subStream.send('ping');
    expect(store.getState().root1.ping).toBeTruthy();
    expect(store.getState().root2.ping).toBeFalsy();

    store.shutdown();
    done();
  });

});
