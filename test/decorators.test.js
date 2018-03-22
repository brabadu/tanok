'use strict';

import React from 'react';
import assert from 'assert';

import {tanokComponent} from '../src/tanok.js';


class MockStreamWrapper {
  constructor(mockName) {
    this.streamName = null;
    this.mockName = mockName;
    this.subs = {
      [this.streamName + '.mockName']: mockName,
    };
  }
  send(action, payload, metadata) {
    throw new Error(`${this.mockName}: action ${action}`);
  }
  subWithMeta(sub, metadata) {
    return this.subs[`${sub}`];
  }

}

describe('tanokDecorators', () => {
  describe('tanokComponent', () => {

    @tanokComponent
    class TestComponent extends React.Component {}

    it('provides "send" method', function (done) {
      assert(TestComponent.prototype.hasOwnProperty('send'),
        'must have method "send"');
      done();
    });

    it('provides "sub" method', function (done) {
      assert(TestComponent.prototype.hasOwnProperty('sub'),
          'must have method "sub" for child component connection'
      );
      done();
    });

    it('handles tanokStream params', function (done) {
      const tanokStream = new MockStreamWrapper('tanok');

      @tanokComponent
      class MockReactComponent {
        constructor() {
          this.props = {
            tanokStream        
          };
        }
      }

      const c = new MockReactComponent();

      assert.throws(() => c.send('foo'), /tanok: action foo/)
      assert(c.sub('mockName') === 'tanok')
      done();
    });

  });
});
