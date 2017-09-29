'use strict';

import Rx from 'rx';
import React from 'react';
import expect from 'expect';

import { childFx, rethrowFx, subcomponentFx, TanokDispatcher, on, effectWrapper
} from '../src/tanok.js';
import { StreamWrapper } from '../src/streamWrapper.js';
import sinon from 'sinon';


describe('fxs', () => {

  class TestDispatcher extends TanokDispatcher {
    @on('init')
    init(_, state) {
      return [state];
    }
  }

  it('subcomponentFx add sub to stream ', function (done) {
    const eventStream = new Rx.Subject();
    const streamWrapper = new StreamWrapper(eventStream, null);
    subcomponentFx('subComponent', new TestDispatcher)(streamWrapper);
    expect(streamWrapper.subs).toHaveProperty('subComponent');
    done();
  });

  it('rethrowFx send action to stream ', function (done) {
    const eventStream = new Rx.Subject();
    const streamWrapper = new StreamWrapper(eventStream, null);
    const spy = sinon.spy(streamWrapper, 'send')
    rethrowFx('action', { a: 1})(streamWrapper);
    expect(spy.calledOnce).toBeTruthy();
    expect(spy.args[0][0]).toEqual('action');
    expect(spy.args[0][1]).toEqual({ a: 1});
    done();
  });

  it('childFx pass action to stream ', function (done) {
    const eventStream = new Rx.Subject();
    const streamWrapper = new StreamWrapper(eventStream, null);
    subcomponentFx('subComponent', new TestDispatcher)(streamWrapper);
    const spy = sinon.spy()
    childFx(spy, 'subComponent')(streamWrapper);
    expect(spy.calledOnce).toBeTruthy();
    done();
  });

  it('childFx pass action to stream with metadata ', function (done) {
    const eventStream = new Rx.Subject();
    const streamWrapper = new StreamWrapper(eventStream, null);
    subcomponentFx('subComponent', new TestDispatcher)(streamWrapper);
    const spy = sinon.spy()
    childFx(spy, 'subComponent', 'someMeta')(streamWrapper);
    expect(spy.calledOnce).toBeTruthy();
    done();
  });
  it('effectWrapper pass action to stream with metadata ', function (done) {
    const eventStream = new Rx.Subject();
    const streamWrapper = new StreamWrapper(eventStream, null);
    subcomponentFx('subComponent', new TestDispatcher)(streamWrapper);
    const spy = sinon.spy()
    effectWrapper(spy, 'subComponent', 'someMeta')(streamWrapper);
    expect(spy.calledOnce).toBeTruthy();
    done();
  });
});
