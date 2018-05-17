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
    const comp = wrapper.find(TestComponent2);
    expect(comp.prop('number')).toEqual(3);

    // dispatch event
    wrapper.find(TestComponent2).prop('tanokStream').send('inc')
    wrapper.update();
    
    const comp2 = wrapper.find(TestComponent2);
    expect(comp2.prop('number')).toEqual(4);

    wrapper.unmount();
    done();
  });

  @tanokComponent
  class TestComponentTwiceNumber extends React.Component {
    render() {
      return (
        <div>{this.props.number}, {this.props.twiceNumber}</div>
      );
    }
  }
  
  it('stateSerializer works', function (done) {
    const update = new TestDispatcher;
    const eventStream = new Rx.Subject();

    function stateSerializer(state) {
      return {
        ...state,
        twiceNumber: state.number * 2,
      }
    }
    const wrapper = mount(
        <TanokInReact
          initialState={{ number: 1 }}
          stateSerializer={stateSerializer}
          update={update}
          view={TestComponentTwiceNumber}
        />
    );
    const comp = wrapper.find(TestComponentTwiceNumber);
    expect(comp.prop('number')).toEqual(1);
    expect(comp.prop('twiceNumber')).toEqual(2);

    // dispatch event
    wrapper.find(TestComponentTwiceNumber).prop('tanokStream').send('inc');
    wrapper.update();
    
    const comp2 = wrapper.find(TestComponentTwiceNumber);
    expect(comp2.prop('number')).toEqual(2);
    expect(comp2.prop('twiceNumber')).toEqual(4);

    wrapper.unmount();
    done();
  });

});
