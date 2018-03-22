
'use strict';

import Rx from 'rx';
import React from 'react';
import expect from 'expect';
import sinon from 'sinon';

import { tanok, TanokDispatcher, on, connect, subcomponentFx } from '../src/tanok.js';
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


describe('subcomponents', () => {

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
