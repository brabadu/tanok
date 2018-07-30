'use strict';

import Rx from '@evo/rx';

import { actionIs } from '../src/helpers';

describe('tanokHelpers', () => {
  describe('actionIs', () => {
    it('passes correct action', (done) => {
      const stream = Rx.Observable.of({ action: 't' });

      actionIs('t').call(stream)
        .subscribe(() => { done() })
    });

    it('filters incorrect action', (done) => {
      const stream = Rx.Observable.of({ action: 'f' });

      actionIs('t').call(stream)
        .subscribe(
          () => { throw new Error },
          (e) => { throw e },
          () => { done() }
        )
    })
  })
});