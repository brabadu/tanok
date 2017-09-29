'use strict';

import Rx from 'rx';
import React from 'react';
import expect from 'expect';
import { mount } from 'enzyme';

import { TanokInReact, TanokDispatcher, on } from '../src/tanok.js';
import { StreamWrapper } from '../src/streamWrapper.js';
import sinon from 'sinon';


describe('tanokInReact', () => {

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

  it('tanokInReact renderred as want', function (done) {
    const update = new TestDispatcher;
    const eventStream = new Rx.Subject();
    const wrapper = mount(
        <TanokInReact
          initialState={{ number: 1 }}
          update={update}
          view={TestComponent}
          outerEventStream={eventStream}
        />
    );
    const comp = wrapper.find(TestComponent);
    expect(comp.props().number).toEqual(1);
    wrapper.unmount();
    done();
  });

});
