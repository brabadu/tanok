'use strict';

import React from 'react';
import expect from 'expect';

import { on, TanokDispatcher } from '../src/tanok.js';


describe('TanokDispatcher', () => {

  class TestDispatcher extends TanokDispatcher {
    @on('init')
    init(_, state) {
      return [1];
    }
  }
  class TestDispatcher2 extends TestDispatcher {
    @on('init')
    init(_, state) {
      return [2];
    }
  }

  it('collect return all possible actions', function (done) {
    const dispatcher = new TestDispatcher;
    const actions = dispatcher.collect();
    expect(actions).toHaveLength(1);
    expect(actions[0][0][0]).toEqual('init');
    done();
  });

  it('iterator works well', function (done) {
    const dispatcher = new TestDispatcher;
    const iteratedDispatcher = [...dispatcher];
    expect(iteratedDispatcher.length).toEqual(1);
    expect(iteratedDispatcher[0][0][0]).toEqual('init');
    done();
  });

  it('inheritance work well', function (done) {
    const dispatcher1 = new TestDispatcher;
    const dispatcher2 = new TestDispatcher2;
    expect(dispatcher1.init()).toEqual([1]);
    expect(dispatcher2.init()).toEqual([2]);
    done();
  });
});
