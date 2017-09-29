'use strict';

import Rx from 'rx';
import React from 'react';
import expect from 'expect';
import { mount } from 'enzyme';

import { tanok, TanokDispatcher, on } from '../src/tanok.js';
import { StreamWrapper } from '../src/streamWrapper.js';
import sinon from 'sinon';


describe('core', () => {

  class TestDispatcher extends TanokDispatcher {
    @on('init')
    init(_, state) {
      return [state];
    }
  }

  class TestComponent extends React.Component {
    render() {
     return (
         <div>{this.props.number}</div>
     );
    }
  }

  it('launch and stop app', function (done) {
    // I want as more coverage as possible muahahaha
    const update = new TestDispatcher;
    const eventStream = new Rx.Subject();
    const outerEventStream = new Rx.Subject();
    const initState = 1;
    const { shutdown } = tanok(initState, update, TestComponent, {
      outerEventStream,
    });
    shutdown();
    done();
  });

});
