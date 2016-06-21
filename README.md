# tanok 💃
State management for React using Rx.js and Elm Architecture inspiration.

You could start with [Elm Architecture Tutorial](https://github.com/evancz/elm-architecture-tutorial/), there's more info

Elm Architecture gives you a way to build complex UI with everything we'd like
to have these days. Unidirectional data flow, separation of concerns,
usable child components and fast HTML rendering.

**tanok** let's you do the same with JavaScript, React and Rx.js.

> **tanok** is also slavic circle dance

# Installation

`npm install tanok`

# Usage

To start with something small and simple we'll make a counter (see file `/examples/simple/simple.js`). First we need a place to store our data.

```
let model = {
  count: 0,
};
```

Next we need rules to update our model

```
let update = [
  ['inc', (params) => (state) => {
    state.count += 1
    return state
  }],
  ['dec', (params) => (state) => {
    state.count -= 1
    return state
  }],
]
```

Last crucial thing for UI is it's visual representation

```
const Counter = React.createClass({
  onPlusClick: function() {
    this.props.eventStream.onNext({
      action: 'inc',
    })
  },
  onMinusClick: function() {
    this.props.eventStream.onNext({
      action: 'dec',
    })
  },
  render: function() {
        return <div>
        <button onClick={this.onPlusClick}>+</button>
        <span>{this.props.count}</span>
        <button onClick={this.onMinusClick}>-</button>
        </div>
    }
});
```

Now on to dancing

```
import tanok from 'tanok/simple.js';
tanok(model, update, Counter, div);
```

This is simple version of tanok. Inside `tanok` function rx.js stream is created, all events go through it and dispatched according to `update` provided. Than dispatcher returns appropriate function and it is applied to current application state to produce new state. New application state is used to render new interface. This way you can add handlers only to synchronous events like mouse clicks or keyboard typing. It is very limited, and is made mainly for educational purposes.

Any serious real-world app needs async calls to server, setTimeout etc. To make it possible we need a thing we call *Effect*


# Authors

Great people of Evo Company:

* [Boryslav Larin](http://github.com/brabadu)
* [Dmitry Sadkovoy](http://github.com/sadkovoy)
* [Valeriy Morkovin](http://github.com/Lex0ne)
* [Anton Verinov](http://github.com/zemlanin)

With thoughful tests and wise advices from many others.
