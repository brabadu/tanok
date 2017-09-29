var jsdom = require('jsdom').JSDOM;
var exposedProperties = ['window', 'navigator', 'document'];

const dom = new jsdom('');

global.window = dom.window;
global.document = dom.window.document;