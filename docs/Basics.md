# Get Started


## Create small model

To start with something small and simple we'll make a counter (see file `examples/1_basic/counter.js`). First we need a place to store our data.


```js
const Model = {
  count: 0,
};
export default Model;
```

## How we update state

Next we need rules to update our model

```js
import { TanokDispatcher, on } from 'tanok';

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


## Visualise our state

Last crucial thing for UI is it's visual representation

```js
import { tanokComponent } from 'tanok';

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


## Get all together

Now on to dancing

```js
import { tanok} from 'tanok';
import Counter from './view';
import CounterDispatcher from './dispatcher';
import Model from './model';


const root = document.getElementById('root');

tanok(Model, new CounterDispatcher(), Counter, {
  container: root
});
```

## Next Steps

Looks pretty good, yeah? But in real world, we always should use async stuff (requests, websockets etc).
Go forward to [async stuff](/docs/AsyncStuff.md) section.

