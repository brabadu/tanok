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

To start with something small and simple we'll make a counter (see file `examples/1_basic/counter.js`). First we need a place to store our data.


```js
export default model = {
  count: 0,
};
```

Next we need rules to update our model

```js
import {TanokDispatcher, on} from 'tanok';

class CounterDispatcher extends TanokDispatcher {

    @on('inc')
    increment(payload, state) {
        state.count += payload;
        return [state];
    }

    @on('dec')
    decrement(payload, state) {
        state.count -= payload;
        return [state];
    }
}

export default CounterDispatcher;
```

Last crucial thing for UI is it's visual representation

```js
import {tanokComponent} from 'tanok';

@tanokComponent
class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.onPlusClick = this.onPlusClick.bind(this);
        this.onMinusClick = this.onMinusClick.bind(this);
    }

    onPlusClick() {
        this.send('inc', 1);
    }

    onMinusClick() {
        this.send('dec', 1);
    }

    render() {
        return (
            <div>
                <button onClick={this.onPlusClick}>+</button>
                <span>
                    {this.props.count}
                </span>
                <button onClick={this.onMinusClick}>-</button>
            </div>
        );
    }
}

export default Counter;
```

Now on to dancing

```js
import {tanok} from 'tanok';
import Counter from './view';
import Dispatcher from './dispatcher';
import model from './model';


const root = document.getElementById('root');

tanok(model, new Dispatcher(), Counter, {
  container: root
});
```

## Async stuff

Now how to make asynchronous calls, like ajax requests, setTimeouts and others?

State mutators return an array with state as it's first item. This state goes
right into React component `setState`, which triggers component rerendering.
Other members of array may be functions (*effects*), which are called sequentially after `setState`.

They get stream as a parameter, so they can make ajax call and do `stream.send`
back to the dispatcher. This is how effect might look like.

```js
function syncEffect(cnt) {
  return function (stream) {
    fetch('http://www.mocky.io/v2/577824a4120000ca28aac904', {
      method: 'POST',
      body: cnt,
    })
      .then((r) => r.json())
      .then((json) => stream.send('syncSuccess', json))
  }
}
```

To run effect we return new state with effect function

 ```js
export class CounterDispatcher extends TanokDispatcher {
  @on('inc')
  inc(payload, state) {
    state.count += 1;
    state.synced = false;

    return [state, syncEffect(state.count)];
  }

  @on('syncSuccess')
  syncSuccess(payload, state) {
    state.synced = true;
    return [state];
  }

  ...
}
 ```

 Effects usually have to change state somehow, so they get stream as parameter. So they can call `stream.send(ACTION, payload)` to update state and trigger another rerendering.

# Authors

Great people of Evo Company:

* [Boryslav Larin](http://github.com/brabadu)
* [Dmitriy Sadkovoy](http://github.com/sadkovoy)
* [Valeriy Morkovyn](http://github.com/Lex0ne)
* [Anton Verinov](http://github.com/zemlanin)

With thoughful tests and wise advices from many others.
