'use strict';

import React from 'react';
import assert from 'assert';

import {tanokComponent} from '../src/tanok.js';


class MockStreamWrapper {
  constructor(mockName) {
    this.mockName = mockName;
    this.subs = { mockName };
  }
  send(action, payload, metadata) {
    throw new Error(`${this.mockName}: action ${action}`);
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

    it('provides "subStream" method', function (done) {
      assert(TestComponent.prototype.hasOwnProperty('subStream'),
          'must have method "subStream" for child component connection'
      );
      done();
    });

    it('provides "sub" method', function (done) {
      assert(TestComponent.prototype.hasOwnProperty('sub'),
          'must have method "sub" for child component connection'
      );
      done();
    });

    it('handles both tanokStream and eventStream params', function (done) {
      @tanokComponent
      class MockReactComponent {
        constructor() {
          this.props = {};
        }
      }

      const tanokStream = new MockStreamWrapper('tanok');
      const eventStream = new MockStreamWrapper('event');
      const c = new MockReactComponent();
      c.props = {
        tanokStream,
        eventStream,
      }
      // c.send('foo')
      assert.throws(() => c.send('foo'), /tanok: action foo/)
      assert(c.sub('mockName') == 'tanok')

      c.props = {
        tanokStream,
      }
      assert.throws(() => c.send('foo'), /tanok: action foo/)
      assert(c.sub('mockName') == 'tanok')

      c.props = {
        eventStream,
      }
      assert.throws(() => c.send('foo'), /event: action foo/)
      assert(c.sub('mockName') == 'event')

      done();
    });

  });
});
