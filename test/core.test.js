'use strict';

import Rx from 'rx';
import React from 'react';
import expect from 'expect';
import sinon from 'sinon';

import { tanok, TanokDispatcher, on, connect } from '../src/tanok.js';

describe('core', () => {
  function initModel() {
    return {
      count: 0,
    }
  };


  class CounterDispatcher extends TanokDispatcher {
    @on('init')
    init(payload, state) {
      return [{
        ...state,
        count: 10,
      }];
    }

    @on('inc')
    inc(payload, state) {
      return [{
        ...state,
        count: state.count + 1,
      }];
    }

    @on('dec')
    dec(payload, state) {
      return [{
        ...state,
        count: state.count - 1,
      }];
    }
  }

  const mapStateToProps = (state) => ({
    count: state.count,
  });

  class Counter extends React.Component {
    constructor(props) {
      super(props);
      this.onPlusClick = this.onPlusClick.bind(this);
      this.onMinusClick = this.onMinusClick.bind(this);
    }

    onPlusClick() {
      this.props.tanokStream.send('inc')
    }

    onMinusClick() {
      this.props.tanokStream.send('dec')
    }

    render() {
      return (
        <div>
          <button onClick={this.onMinusClick}>-</button>
          <span id="counter">{this.props.count}</span>
          <button id="inc" onClick={this.onPlusClick}>+</button>
        </div>
      );
    }
  }

  const ConnectedCounter = connect(mapStateToProps)(Counter);

  it('launch and stop app connected', function (done) {
    const update = new CounterDispatcher;
    const outerEventStream = new Rx.Subject();
    const { shutdown, store } = tanok(initModel(), update, ConnectedCounter, {
      outerEventStream,
    });

    const spy = sinon.spy();
    store.subscribe(spy);
    expect(document.querySelector('#counter').innerHTML).toEqual("10");
    document.querySelector('#inc').click();
    expect(document.querySelector('#counter').innerHTML).toEqual("11");
    expect(spy.calledOnce).toBeTruthy();
    shutdown();
    done();
  });
  it('launch and stop app unconnected', function (done) {
    const update = new CounterDispatcher;
    const outerEventStream = new Rx.Subject();
    const { shutdown, store } = tanok(initModel(), update, Counter, {
      outerEventStream,
    });

    expect(document.querySelector('#counter').innerHTML).toEqual("10");
    document.querySelector('#inc').click();
    expect(document.querySelector('#counter').innerHTML).toEqual("11");
    shutdown();
    done();
  });

});
