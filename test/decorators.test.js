'use strict';

import Rx from '@evo/rx';
import React from 'react';
import assert from 'assert';

import { tanokComponent, StreamWrapper } from '../src/tanok.js';
import { Stream } from 'stream';



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
      done();
    });

    it('tanokCompoment.sub call returns StreamWrapper instance', function (done) {
      // const tanokStream = new StreamWrapper('tanok');
      const eventStream = new Rx.Subject();
      const tanokStream = new StreamWrapper(eventStream, null);
      tanokStream.metadata.push(null);

      const subName = 'mockName';
      tanokStream.subStream(subName, []);

      @tanokComponent
      class MockReactComponent {
        constructor() {
          this.props = {
            tanokStream        
          };
        }
      }

      const c = new MockReactComponent();

      assert(c.sub(subName) instanceof StreamWrapper)
      done();
    });

  });
});
