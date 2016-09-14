'use strict'

const assert = require("assert")

const Rx = require("rx")
const tanokModule = require("../lib/tanok.js")

describe('tanokModule', function () {
  describe('actionIs', function () {
    it('passes correct action', function (done) {
      const stream = Rx.Observable.of({action: 't'})

      tanokModule.actionIs('t').call(stream)
        .subscribe(function () { done() })
    })

    it('filters incorrect action', function (done) {
      const stream = Rx.Observable.of({action: 'f'})

      tanokModule.actionIs('t').call(stream)
        .subscribe(
          function () { throw new Error },
          function (e) { throw e },
          function () { done() }
        )
    })
  })
})
