'use strict';

import Rx from 'rx';
import React from 'react';
import expect from 'expect';
import { mount } from 'enzyme';

import { TanokInReact, TanokDispatcher, on, connect } from '../src/tanok.js';


describe('tanokInReact', () => {

  class TestDispatcher extends TanokDispatcher {
    @on('init')
    init(_, state) {
      return [state];
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

  it('tanokInReact renderred as want', function (done) {
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

});
