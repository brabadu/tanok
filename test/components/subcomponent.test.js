'use strict';

import Rx from 'rx';
import PropTypes from 'prop-types';
import React from 'react';
import expect from 'expect';

import TestUtils from 'react-dom/test-utils'

import { on, TanokDispatcher } from "../../src/tanokDispatcher";
import { Subcomponent } from '../../src/components/subcomponent';
import { StreamWrapper } from '../../src/streamWrapper.js';
import {storeKey, streamKey} from "../../src/constants";
import {Root} from "../../src/components/root";


describe('subcomponent', () => {

  const createChild = () => {
    class Child extends React.Component {
      render() {
        return <div />
      }
    }

    Child.contextTypes = {
      [streamKey]: PropTypes.any.isRequired,
      [storeKey]: PropTypes.any.isRequired,
    }

    return Child
  }
  const Child = createChild();

  class TestDispatcher extends TanokDispatcher {
    @on('init')
    init(_, state) {
      return [state];
    }
  }

  it('subcomponent rewrite stream context', function (done) {
    const eventStream = new Rx.Subject();
    const tanokStream = new StreamWrapper(eventStream, null);
    const subName = 'subComponent';
    tanokStream.subStream(subName, new TestDispatcher);
    expect(tanokStream.subs).toHaveProperty([`${tanokStream.streamName}.${subName}`]);
    const subStateValue = 1;

    const tree = TestUtils.renderIntoDocument(
      <Root tanokStream={tanokStream} store={{
        subscribe: () => {},
        getState: () => ({
          subState: subStateValue
        }),
      }}>
        <Subcomponent
          name={subName}
          selector={(state) => state.subState}
        >
          <Child />
        </Subcomponent>
      </Root>
    )

    const child = TestUtils.findRenderedComponentWithType(tree, Child);
    expect(child.context[streamKey].streamName).toBe(`${tanokStream.streamName}.${subName}`);
    expect(child.context[storeKey].getState()).toBe(subStateValue);

    done();
  });

});
