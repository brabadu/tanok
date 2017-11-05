'use strict';

import Rx from 'rx';
import React from 'react';
import expect from 'expect';

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
      state.count = 10;
      return [state];
    }

    @on('inc')
    inc(payload, state) {
      state.count += 1;
      return [state];
    }

    @on('dec')
    dec(payload, state) {
      state.count -= 1;
      return [state];
    }
  }

  const mapStateToProps = (state) => ({
    count: state.count,
  })

  @connect(mapStateToProps)
  class Counter extends React.Component {
    constructor(props) {
      super(props);
      this.onPlusClick = this.onPlusClick.bind(this);
      this.onMinusClick = this.onMinusClick.bind(this);
    }

    onPlusClick() {
      this.props.send('inc')
    }

    onMinusClick() {
      this.props.send('dec')
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

  it('launch and stop app', function (done) {
    const update = new CounterDispatcher;
    const outerEventStream = new Rx.Subject();
    const { shutdown } = tanok(initModel(), update, Counter, {
      outerEventStream,
    });
    expect(document.querySelector('#counter').innerHTML).toEqual("10");
    document.querySelector('#inc').click();
    expect(document.querySelector('#counter').innerHTML).toEqual("11");
    shutdown();
    done();
  });

});
