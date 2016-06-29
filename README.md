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

`model.js`
```
export default model = {
  count: 0,
};
```

Next we need rules to update our model

`dispatcher.js`
```

import {TanokDispatcher} from 'tanok';
import {on} from 'tanok/lib/decorators';

class CounterDispatcher extends TanokDispatcher {

    @on('inc')
    increment(eventPayload, state) {
        state.count += 1;
        return [state];
    }

    @on('dec')
    decrement(eventPayload, state) {
        state.count -= 1;
        return [state];
    }
}

export default CounterDispatcher;
```

Last crucial thing for UI is it's visual representation

`view.js`
```
import tanokComponent from 'tanok/lib/component';

@tanokComponent
class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.onPlusClick = this.onPlusClick.bind(this);
        this.onMinusClick = this.onMinusClick.bind(this);
    }

    onPlusClick() {
        this.send('inc');
    }

    onMinusClick() {
        this.send('dec');
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

```
import tanok from 'tanok';
import Counter from './view';
import Dispatcher from './dispatcher';
import model from './model';


const mountNode = document.createElement('div');
document.body.appendChild(mountNode);
const counterDispatcher = new Dispatcher();

tanok(model, counterDispatcher.collect(), Counter, mountNode);
```

This is simple version of tanok. Inside `tanok` function rx.js stream is created, all events go through it and dispatched according to `dispatcher` provided. Than dispatcher returns appropriate function and it is applied to current application state to produce new state. New application state is used to render new interface. This way you can add handlers only to synchronous events like mouse clicks or keyboard typing. It is very limited, and is made mainly for educational purposes.

Any serious real-world app needs async calls to server, setTimeout etc. To make it possible we need a thing we call *Effect*


# Authors

Great people of Evo Company:

* [Boryslav Larin](http://github.com/brabadu)
* [Dmitriy Sadkovoy](http://github.com/sadkovoy)
* [Valeriy Morkovyn](http://github.com/Lex0ne)
* [Anton Verinov](http://github.com/zemlanin)

With thoughful tests and wise advices from many others.
