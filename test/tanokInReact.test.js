'use strict';

import Rx from 'rx';
import React from 'react';
import expect from 'expect';
import { mount } from 'enzyme';

import {
  TanokInReact, TanokDispatcher,
  on, connect, tanokComponent
} from '../src/tanok.js';


describe('tanokInReact', () => {

  class TestDispatcher extends TanokDispatcher {
    @on('init')
    init(_, state) {
      return [state];
    }

    @on('inc')
    inc(_, state) {
      state.number += 1;
      return [{...state}];
    }
  }


  @connect((state) => ({ number: state.number}))
  class TestComponent extends React.Component {
    render() {
     return (
         <div>{this.props.number}</div>
     );
    }
  }

  it('with store renderred as want', function (done) {
    const update = new TestDispatcher;
    const eventStream = new Rx.Subject();
    const testMiddleware = (stream) => {
      expect(stream).not.toBeNull();
      expect(stream).not.toBeUndefined();
      return (next) => (state) => {
        return next(state);
      }
    }
    const wrapper = mount(
        <TanokInReact
          initialState={{ number: 1 }}
          update={update}
          view={TestComponent}
          outerEventStream={eventStream}
          middlewares={[testMiddleware]}
        />
    );
    const comp = wrapper.find(TestComponent).children();
    expect(comp.props().number).toEqual(1);
    wrapper.unmount();
    done();
  });

  @tanokComponent
  class TestComponent2 extends React.Component {
    render() {
      return (
         <div>{this.props.number}</div>
      );
    }
  }

  it('without store renderred as want', function (done) {
    const update = new TestDispatcher;
    const eventStream = new Rx.Subject();
    const wrapper = mount(
        <TanokInReact
          initialState={{ number: 3 }}
          update={update}
          view={TestComponent2}
        />
    );
    const comp = wrapper.find(TestComponent2).children();
    expect(comp.html()).toEqual('<div>3</div>');

    // dispatch event
    wrapper.find(TestComponent2).prop('tanokStream').send('inc')
    
    const comp2 = wrapper.find(TestComponent2).children();
    expect(comp2.html()).toEqual('<div>4</div>');

    wrapper.unmount();
    done();
  });

});
