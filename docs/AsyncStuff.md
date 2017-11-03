# Async stuff

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

To run effect we return new state with effect function.

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

Effects usually have to change state somehow, so they get stream as parameter.
So they can call `stream.send(ACTION, payload)` to update state and trigger another rerendering.
