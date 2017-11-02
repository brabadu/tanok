## function tanok(initialState, update, view, options)

Main entry point and the easiest way to create tanok app.
Examples:
```js
import {tanok} from 'tanok';
...
tanok(
    {counter: 0},
    new CounterDispatcher,
    CounterView, {
        container: document.getElementById('root'),
    }
);
```

### Parameters:
   * **`initialState`** - initial state of app. May be any type, usually it's object or instance of some class, that incapsulates all data to start your app.
   * **`update`** - instance of `TanokDispatcher`, which describes actions of your app. Same as reducers in Redux.
   * **`view`** - Root React component
   * **`options`** - object, additional configuration for your app:
      * **`container`** - HTMLElement, root node of your application. If not provided, new "div" will be created appended to `document.body`.
      * **`outerEventStream`** - `Rx.Observable`, that can pass actions into app from outside world
      * **`stateSerializer`** - `Function`, that is called on every action. It's return is then passed as props to View component, if not specified state is passed as is.
      * **`middlewares`** - List of middlewares, which are called on action. May intercept actions for analytics, debugging and other purposes

Returns object with keys:
   * **`streamWrapper`** - `StreamWrapper` instance, that was created to pass all actions in app. May be used to send actions inside app
   * **`shutdown`** - `Function`, that closes all `streamWrapper` and all other side-effects that was created by app, unmounts View from DOM.
   * **`component`** - React object, that is returned by `ReactDOM.render`.