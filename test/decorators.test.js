'use strict';

import React from 'react';
import assert from 'assert';

import { tanokComponent } from '../src/decorators.js';

describe('tanokDecorators', () => {
  describe('tanokComponent', () => {
    
    @tanokComponent
    class TestComponent extends React.Component {}
    
    it('provides "send" method', function (done) {      
      assert(TestComponent.prototype.hasOwnProperty('send'), 'must have method "send"');      
      done();
    });
    
    it('provides "subStream" method', function (done) {
      assert(TestComponent.prototype.hasOwnProperty('subStream'), 
          'must have method "subStream" for child component connection'
      );
      done();
    })
    
  })
});
