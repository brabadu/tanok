'use strict'

const assert = require("assert")

const Rx = require("rx")
const tanokHelpers = require("../dist/helpers.js")

describe('tanokHelpers', function () {
  describe('actionIs', function () {
    it('passes correct action', function (done) {
      const stream = Rx.Observable.of({action: 't'})

      tanokHelpers.actionIs('t').call(stream)
        .subscribe(function () { done() })
    })

    it('filters incorrect action', function (done) {
      const stream = Rx.Observable.of({action: 'f'})

      tanokHelpers.actionIs('t').call(stream)
        .subscribe(
          function () { throw new Error },
          function (e) { throw e },
          function () { done() }
        )
    })
  })
})
