"use strict";

var _ = methodName => ( (...args) => {
    var args = args;
    return function() {return this[methodName].apply(this, args)}
})

export var filter = _('filter');

export var debounce = _('debounce');

export var actionIs = actionName => (
    function() { return filter(({action}) => action === actionName).call(this)}
);

