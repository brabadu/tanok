/*eslint-disable react/prop-types*/

import Rx from '@evo/rx';
import expect from 'expect'
import sinon from 'sinon';
import React, { Children, Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import TestUtils from 'react-dom/test-utils'
import { TanokDispatcher, on } from "../src/tanokDispatcher";

import { createStore } from '../src/createStore';
import { connect } from '../src/connect/connect'
import {Root} from "../src/components/root";

describe('React', () => {
  describe('connect', () => {
  function initModel() {
    return {
      count: 0,
    }
  };


  class CounterDispatcher extends TanokDispatcher {
    @on('inc')
    inc(payload, state) {
      return [{
        ...state,
        count: state.count + 1,
      }];
    }

    @on('mock')
    mock(payload, state) {
      return [state];
    }
  }

    class Passthrough extends Component {
      render() {
        return <div />
      }
    }

    class RootMock extends Component {
      getChildContext() {
        return { store: this.props.store, stream: this.props.tanokStream }
      }

      render() {
        return Children.only(this.props.children)
      }
    }
    RootMock.childContextTypes = {
      store: PropTypes.object.isRequired,
      stream: PropTypes.any.isRequired,
    }

    it('should receive the store in the context', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      @connect()
      class Container extends Component {
        render() {
          return <Passthrough {...this.props} />
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <RootMock store={store} tanokStream={tanokStream}>
          <Container pass="through" />
        </RootMock>
      )

      const container = TestUtils.findRenderedComponentWithType(tree, Container)
      expect(container.context.store).toBe(store)
      expect(container.context.stream).toBe(tanokStream)
    })

    it('should pass state and props to the given component', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      @connect(({ count }) => ({ count }))
      class Container extends Component {
        render() {
          return <Passthrough {...this.props} />
        }
      }

      const container = TestUtils.renderIntoDocument(
        <RootMock store={store} tanokStream={tanokStream}>
          <Container pass="through" baz={50} />
        </RootMock>
      )
      const stub = TestUtils.findRenderedComponentWithType(container, Passthrough)
      expect(stub.props.pass).toEqual('through');
      expect(stub.props.count).toEqual(0);
      expect(stub.props.hello).toEqual(undefined);
    })

    it('should subscribe class components to the store changes', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      @connect(({ count }) => ({ count }))
      class Container extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <RootMock store={store} tanokStream={tanokStream}>
          <Container />
        </RootMock>
      )

      const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
      expect(stub.props.count).toBe(0)
      tanokStream.send('inc');
      expect(stub.props.count).toBe(1)
      tanokStream.send('inc');
      expect(stub.props.count).toBe(2)
    })

    it('should subscribe pure function components to the store changes', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      let Container = connect(
        state => ({ count: state.count })
      )(function Container(props) {
        return <Passthrough {...props}/>
      })

      const tree = TestUtils.renderIntoDocument(
        <RootMock store={store} tanokStream={tanokStream}>
          <Container />
        </RootMock>
      )

      const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
      expect(stub.props.count).toBe(0)
      tanokStream.send('inc');
      expect(stub.props.count).toBe(1)
      tanokStream.send('inc');
      expect(stub.props.count).toBe(2)
    })

    it('should handle send before componentDidMount', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      @connect(state => ({ count: state.count }) )
      class Container extends Component {
        componentWillMount() {
          this.props.send('inc')
        }

        render() {
          return <Passthrough {...this.props}/>
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <RootMock store={store} tanokStream={tanokStream}>
          <Container />
        </RootMock>
      )

      const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
      expect(stub.props.count).toBe(1)
    })

    it('should handle additional prop changes in addition to slice', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      @connect(state => state)
      class ConnectContainer extends Component {
        render() {
          return (
            <Passthrough {...this.props} pass={this.props.bar.baz} />
          )
        }
      }

      class Container extends Component {
        constructor() {
          super()
          this.state = {
            bar: {
              baz: ''
            }
          }
        }

        componentDidMount() {
          this.setState({
            bar: Object.assign({}, this.state.bar, { baz: 'through' })
          })
        }

        render() {
          return (
            <RootMock store={store} tanokStream={tanokStream}>
              <ConnectContainer bar={this.state.bar} />
             </RootMock>
          )
        }
      }

      const container = TestUtils.renderIntoDocument(<Container />)
      const stub = TestUtils.findRenderedComponentWithType(container, Passthrough)
      expect(stub.props.count).toEqual(0)
      expect(stub.props.pass).toEqual('through')
    })

    it('should ignore deep mutations in props', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      @connect(state => state)
      class ConnectContainer extends Component {
        render() {
          return (
            <Passthrough {...this.props} pass={this.props.bar.baz} />
          )
        }
      }

      class Container extends Component {
        constructor() {
          super()
          this.state = {
            bar: {
              baz: ''
            }
          }
        }

        componentDidMount() {
          // Simulate deep object mutation
          const bar = this.state.bar
          bar.baz = 'through'
          this.setState({
            bar
          })
        }

        render() {
          return (
            <RootMock store={store} tanokStream={tanokStream}>
              <ConnectContainer bar={this.state.bar} />
            </RootMock>
          )
        }
      }

      const container = TestUtils.renderIntoDocument(<Container />)
      const stub = TestUtils.findRenderedComponentWithType(container, Passthrough)
      expect(stub.props.count).toEqual(0)
      expect(stub.props.pass).toEqual('')
    })

    it('should merge actionProps into WrappedComponent', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      @connect(
        state => state,
        send => ({ send })
      )
      class Container extends Component {
        render() {
          return <Passthrough {...this.props} />
        }
      }

      const container = TestUtils.renderIntoDocument(
        <RootMock store={store} tanokStream={tanokStream}>
          <Container pass="through" />
        </RootMock>
      )
      const stub = TestUtils.findRenderedComponentWithType(container, Passthrough)
      expect(stub.props.dispatch).toEqual(store.dispatch)
      expect(stub.props.count).toEqual(0)
      const decorated = TestUtils.findRenderedComponentWithType(container, Container)
      expect(decorated.isSubscribed()).toBe(true)
    })

    it('should not invoke mapState when props change if it only has one argument', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      let invocationCount = 0

      /*eslint-disable no-unused-vars */
      @connect((arg1) => {
        invocationCount++
        return {}
      })
      /*eslint-enable no-unused-vars */
      class WithoutProps extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super()
          this.state = { foo: 'FOO' }
        }

        setFoo(foo) {
          this.setState({ foo })
        }

        render() {
          return (
            <div>
              <WithoutProps {...this.state} />
            </div>
          )
        }
      }

      let outerComponent
      TestUtils.renderIntoDocument(
        <RootMock store={store} tanokStream={tanokStream}>
          <OuterComponent ref={c => outerComponent = c} />
        </RootMock>
      )
      outerComponent.setFoo('BAR')
      outerComponent.setFoo('DID')

      expect(invocationCount).toEqual(1)
    })

    it('should invoke mapState every time props are changed if it has zero arguments', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      let invocationCount = 0

      @connect(() => {
        invocationCount++
        return {}
      })

      class WithoutProps extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super()
          this.state = { foo: 'FOO' }
        }

        setFoo(foo) {
          this.setState({ foo })
        }

        render() {
          return (
            <div>
              <WithoutProps {...this.state} />
            </div>
          )
        }
      }

      let outerComponent
      TestUtils.renderIntoDocument(
        <RootMock store={store} tanokStream={tanokStream}>
          <OuterComponent ref={c => outerComponent = c} />
        </RootMock>
      )
      outerComponent.setFoo('BAR')
      outerComponent.setFoo('DID')

      expect(invocationCount).toEqual(3)
    })

    it('should invoke mapState every time props are changed if it has a second argument', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      let propsPassedIn
      let invocationCount = 0

      @connect((state, props) => {
        invocationCount++
        propsPassedIn = props
        return {}
      })
      class WithProps extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super()
          this.state = { foo: 'FOO' }
        }

        setFoo(foo) {
          this.setState({ foo })
        }

        render() {
          return (
            <div>
              <WithProps {...this.state} />
            </div>
          )
        }
      }

      let outerComponent
      TestUtils.renderIntoDocument(
        <RootMock store={store} tanokStream={tanokStream}>
          <OuterComponent ref={c => outerComponent = c} />
        </RootMock>
      )

      outerComponent.setFoo('BAR')
      outerComponent.setFoo('BAZ')

      expect(invocationCount).toEqual(3)
      expect(propsPassedIn).toEqual({
        foo: 'BAZ'
      })
    })

    it('should not invoke mapDispatch when props change if it only has one argument', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      let invocationCount = 0

      /*eslint-disable no-unused-vars */
      @connect(null, (arg1) => {
        invocationCount++
        return {}
      })
      /*eslint-enable no-unused-vars */
      class WithoutProps extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super()
          this.state = { foo: 'FOO' }
        }

        setFoo(foo) {
          this.setState({ foo })
        }

        render() {
          return (
            <div>
              <WithoutProps {...this.state} />
            </div>
          )
        }
      }

      let outerComponent
      TestUtils.renderIntoDocument(
        <RootMock store={store} tanokStream={tanokStream}>
          <OuterComponent ref={c => outerComponent = c} />
        </RootMock>
      )

      outerComponent.setFoo('BAR')
      outerComponent.setFoo('DID')

      expect(invocationCount).toEqual(1)
    })

    it('should invoke mapDispatch every time props are changed if it has zero arguments', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      let invocationCount = 0

      @connect(null, () => {
        invocationCount++
        return {}
      })

      class WithoutProps extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super()
          this.state = { foo: 'FOO' }
        }

        setFoo(foo) {
          this.setState({ foo })
        }

        render() {
          return (
            <div>
              <WithoutProps {...this.state} />
            </div>
          )
        }
      }

      let outerComponent
      TestUtils.renderIntoDocument(
        <RootMock store={store} tanokStream={tanokStream}>
          <OuterComponent ref={c => outerComponent = c} />
        </RootMock>
      )

      outerComponent.setFoo('BAR')
      outerComponent.setFoo('DID')

      expect(invocationCount).toEqual(3)
    })

    it('should invoke mapDispatch every time props are changed if it has a second argument', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      let propsPassedIn
      let invocationCount = 0

      @connect(null, (dispatch, props) => {
        invocationCount++
        propsPassedIn = props
        return {}
      })
      class WithProps extends Component {
        render() {
          return <Passthrough {...this.props}/>
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super()
          this.state = { foo: 'FOO' }
        }

        setFoo(foo) {
          this.setState({ foo })
        }

        render() {
          return (
            <div>
              <WithProps {...this.state} />
            </div>
          )
        }
      }

      let outerComponent
      TestUtils.renderIntoDocument(
        <RootMock store={store} tanokStream={tanokStream}>
          <OuterComponent ref={c => outerComponent = c} />
        </RootMock>
      )

      outerComponent.setFoo('BAR')
      outerComponent.setFoo('BAZ')

      expect(invocationCount).toEqual(3)
      expect(propsPassedIn).toEqual({
        foo: 'BAZ'
      })
    })

    it('should pass dispatch and avoid subscription if arguments are falsy', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      function runCheck(...connectArgs) {
        @connect(...connectArgs)
        class Container extends Component {
          render() {
            return <Passthrough {...this.props} />
          }
        }

        const container = TestUtils.renderIntoDocument(
          <RootMock store={store} tanokStream={tanokStream}>
            <Container pass="through" />
          </RootMock>
        )
        const stub = TestUtils.findRenderedComponentWithType(container, Passthrough)
        expect(stub.props.dispatch).toEqual(store.dispatch)
        expect(stub.props.count).toBe(undefined)
        expect(stub.props.pass).toEqual('through')
        const decorated = TestUtils.findRenderedComponentWithType(container, Container)
        expect(decorated.isSubscribed()).toBe(false)
      }

      runCheck()
      runCheck(null, null, null)
      runCheck(false, false, false)
    })

    it('should unsubscribe before unmounting', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());
      const subscribe = store.subscribe

      // Keep track of unsubscribe by wrapping subscribe()
      const spy = sinon.spy(() => ({}))
      store.subscribe = (listener) => {
        const unsubscribe = subscribe(listener)
        return () => {
          spy()
          return unsubscribe()
        }
      }

      @connect(
        state => ({ string: state }),
        dispatch => ({ dispatch })
      )
      class Container extends Component {
        render() {
          return <Passthrough {...this.props} />
        }
      }

      const div = document.createElement('div')
      ReactDOM.render(
        <RootMock store={store} tanokStream={tanokStream}>
          <Container />
        </RootMock>,
        div
      )

      expect(spy.callCount).toBe(0)
      ReactDOM.unmountComponentAtNode(div)
      expect(spy.callCount).toBe(1)
    })

    it('should not attempt to set state after unmounting', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());
      let mapStateToPropsCalls = 0

      @connect(
        () => ({ calls: ++mapStateToPropsCalls }),
        dispatch => ({ dispatch })
      )
      class Container extends Component {
        render() {
          return <Passthrough {...this.props} />
        }
      }

      const div = document.createElement('div')
      store.subscribe(() =>
        ReactDOM.unmountComponentAtNode(div)
      )
      ReactDOM.render(
        <RootMock store={store} tanokStream={tanokStream}>
          <Container />
        </RootMock>,
        div
      )

      expect(mapStateToPropsCalls).toBe(1)
      const spy = sinon.spy(console, 'error')
      tanokStream.send('inc')
      expect(spy.callCount).toBe(0)
      expect(mapStateToPropsCalls).toBe(1)
      console.error.restore()
    })

    it('should not attempt to notify unmounted child of state change', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());

      @connect((state) => ({ count: state.count === 2 }))
      class App extends Component {
        render() {
          return this.props.hide ? null : <Container />
        }
      }

      @connect(() => ({}))
      class Container extends Component {
        render() {
          return (
            <Child />
          )
        }
      }

      @connect((state) => ({ state }))
      class Child extends Component {
        componentWillReceiveProps(nextProps) {
          if (nextProps.state.count === 1) {
            tanokStream.send('inc');
          }
        }
        render() {
          return null;
        }
      }

      const div = document.createElement('div')
      ReactDOM.render(
        <RootMock store={store} tanokStream={tanokStream}>
          <App />
        </RootMock>,
        div
      )

      try {
        tanokStream.send('inc');
      } finally {
        ReactDOM.unmountComponentAtNode(div)
      }
    })

    it('should not attempt to set state after unmounting nested components', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());
      let mapStateToPropsCalls = 0

      let linkA, linkB

      let App = ({ children, setLocation }) => {
        const onClick = to => event => {
          event.preventDefault()
          setLocation(to)
        }
        /* eslint-disable react/jsx-no-bind */
        return (
          <div>
            <a href="#" onClick={onClick('a')} ref={c => { linkA = c }}>A</a>
            <a href="#" onClick={onClick('b')} ref={c => { linkB = c }}>B</a>
            {children}
          </div>
        )
        /* eslint-enable react/jsx-no-bind */
      }
      App = connect(() => ({}))(App)


      let A = () => (<h1>A</h1>)
      A = connect(() => ({ calls: ++mapStateToPropsCalls }))(A)


      const B = () => (<h1>B</h1>)


      class RouterMock extends React.Component {
        constructor(...args) {
          super(...args)
          this.state = { location: { pathname: 'a' } }
          this.setLocation = this.setLocation.bind(this)
        }

        setLocation(pathname) {
          this.setState({ location: { pathname } })
          tanokStream.send('inc')
        }

        getChildComponent(location) {
          switch (location) {
            case 'a': return <A />
            case 'b': return <B />
            default: throw new Error('Unknown location: ' + location)
          }
        }

        render() {
          return (<App setLocation={this.setLocation}>
            {this.getChildComponent(this.state.location.pathname)}
          </App>)
        }
      }


      const div = document.createElement('div')
      document.body.appendChild(div)
      ReactDOM.render(
        (<RootMock store={store} tanokStream={tanokStream}>
          <RouterMock />
        </RootMock>),
        div
      )

      const spy = sinon.spy(console, 'error')

      linkA.click()
      linkB.click()
      linkB.click()
      console.error.restore();

      document.body.removeChild(div)
      expect(mapStateToPropsCalls).toBe(3)
      expect(spy.callCount).toBe(0)
    })

    it('should not attempt to set state when dispatching in componentWillUnmount', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());
      let mapStateToPropsCalls = 0

      /*eslint-disable no-unused-vars */
      @connect(
        (state) => ({ calls: mapStateToPropsCalls++ }),
        send => ({ send })
      )
      /*eslint-enable no-unused-vars */
      class Container extends Component {
        componentWillUnmount() {
          this.props.send('inc')
        }
        render() {
          return <Passthrough {...this.props} />
        }
      }

      const div = document.createElement('div')
      ReactDOM.render(
        <RootMock store={store} tanokStream={tanokStream}>
          <Container />
        </RootMock>,
        div
      )
      expect(mapStateToPropsCalls).toBe(1)

      const spy = sinon.spy(console, 'error')
      ReactDOM.unmountComponentAtNode(div)
      console.error.restore()
      expect(spy.callCount).toBe(0)
      expect(mapStateToPropsCalls).toBe(1)
    })

    it('should shallowly compare the selected state to prevent unnecessary updates', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());
      const spy = sinon.spy(() => ({}))
      function render({ count }) {
        spy()
        return <Passthrough count={count}/>
      }

      @connect(
        state => ({ count: state.count }),
        send => ({ send })
      )
      class Container extends Component {
        render() {
          return render(this.props)
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <RootMock store={store} tanokStream={tanokStream}>
          <Container />
        </RootMock>
      )

      const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
      expect(spy.callCount).toBe(1)
      tanokStream.send('inc');
      expect(stub.props.count).toBe(1)
      expect(spy.callCount).toBe(2)
      tanokStream.send('inc');
      expect(spy.callCount).toBe(3)
      tanokStream.send('mock');
      expect(spy.callCount).toBe(3)
    })

    it('should shallowly compare the merged state to prevent unnecessary updates', () => {
      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());
      const spy = sinon.spy(() => ({}))
      function render({ count, pass }) {
        spy()
        return <Passthrough count={count} pass={pass} passVal={pass.val} />
      }

      @connect(
        state => ({ count: state.count }),
        send => ({ send }),
        (stateProps, sendProps, parentProps) => ({
          ...sendProps,
          ...stateProps,
          ...parentProps
        })
      )
      class Container extends Component {
        render() {
          return render(this.props)
        }
      }

      class Root extends Component {
        constructor(props) {
          super(props)
          this.state = { pass: '' }
        }

        render() {
          return (
            <RootMock store={store} tanokStream={tanokStream}>
              <Container pass={this.state.pass} />
            </RootMock>
          )
        }
      }

      const tree = TestUtils.renderIntoDocument(<Root />)
      const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
      expect(spy.callCount).toBe(1)
      expect(stub.props.count).toBe(0)
      expect(stub.props.pass).toBe('')

      tanokStream.send('inc');
      console.log(stub.props)
      expect(spy.callCount).toBe(2)
      expect(stub.props.count).toBe(1)
      expect(stub.props.pass).toBe('')

      tree.setState({ pass: '' })
      expect(spy.callCount).toBe(2)
      expect(stub.props.count).toBe(1)
      expect(stub.props.pass).toBe('')

      tree.setState({ pass: 'through' })
      expect(spy.callCount).toBe(3)
      expect(stub.props.count).toBe(1)
      expect(stub.props.pass).toBe('through')

      tree.setState({ pass: 'through' })
      expect(spy.callCount).toBe(3)
      expect(stub.props.count).toBe(1)
      expect(stub.props.pass).toBe('through')

      const obj = { prop: 'val' }
      tree.setState({ pass: obj })
      expect(spy.callCount).toBe(4)
      expect(stub.props.count).toBe(1)
      expect(stub.props.pass).toBe(obj)

      tree.setState({ pass: obj })
      expect(spy.callCount).toBe(4)
      expect(stub.props.count).toBe(1)
      expect(stub.props.pass).toBe(obj)

      const obj2 = Object.assign({}, obj, { val: 'otherval' })
      tree.setState({ pass: obj2 })
      expect(spy.callCount).toBe(5)
      expect(stub.props.count).toBe(1)
      expect(stub.props.pass).toBe(obj2)

      obj2.val = 'mutation'
      tree.setState({ pass: obj2 })
      expect(spy.callCount).toBe(5)
      expect(stub.props.count).toBe(1)
      expect(stub.props.passVal).toBe('otherval')
    })


    it('should hoist non-react statics from wrapped component', () => {
      class Container extends Component {
        render() {
          return <Passthrough />
        }
      }

      Container.howIsTanok = () => 'Awesome!'
      Container.foo = 'bar'

      const decorator = connect(state => state)
      const decorated = decorator(Container)

      expect(decorated.howIsTanok()).toBe('Awesome!')
      expect(decorated.foo).toBe('bar')
    })

    it('should use the store from the props instead of from the context if present', () => {
      class Container extends Component {
        render() {
          return <Passthrough />
        }
      }

      let actualState

      const expectedState = { foos: {} }
      const decorator = connect(state => {
        actualState = state
        return {}
      })
      const Decorated = decorator(Container)
      const mockStore = {
        dispatch: () => {},
        subscribe: () => {},
        getState: () => expectedState
      }

      TestUtils.renderIntoDocument(<Decorated store={mockStore} stream={{ send: () => {}}}/>)

      expect(actualState).toEqual(expectedState)
    })

    it('should notify nested components through a blocking component', () => {
      @connect(state => ({ count: state }))
      class Parent extends Component {
        render() { return <BlockUpdates><Child /></BlockUpdates> }
      }

      class BlockUpdates extends Component {
        shouldComponentUpdate() { return false; }
        render() { return this.props.children; }
      }

      const mapStateToProps = state => ({ count: state.count })
      const spy = sinon.spy(mapStateToProps);
      @connect(spy)
      class Child extends Component {
        render() { return <div>{this.props.count}</div> }
      }

      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());
      TestUtils.renderIntoDocument(
        <RootMock store={store} tanokStream={tanokStream}><Parent /></RootMock>)

      expect(spy.callCount).toBe(1)
      tanokStream.send('inc');
      expect(spy.callCount).toBe(2)
    })

    it('should subscribe properly when a middle connected component does not subscribe', () => {

      @connect(state => ({ count: state }))
      class A extends React.Component { render() { return <B {...this.props} /> }}

      @connect() // no mapStateToProps. therefore it should be transparent for subscriptions
      class B extends React.Component { render() { return <C {...this.props} /> }}

      @connect((state, props) => {
        expect(props.count).toBe(state)
        return { count: state * 10 + props.count }
      })
      class C extends React.Component { render() { return <div>{this.props.count}</div> }}

      const [tanokStream, store] = createStore(initModel(), new CounterDispatcher());
      TestUtils.renderIntoDocument(<RootMock store={store} tanokStream={tanokStream}><A /></RootMock>)

      tanokStream.send('inc');
    })

    it('should subscribe properly when a new store is provided via props', () => {
      const [tanokStream1, store1] = createStore(initModel(), new CounterDispatcher());
      const [tanokStream2, store2] = createStore(initModel(), new CounterDispatcher());

      @connect(state => ({ count: state.count }))
      class A extends Component {
        render() { return <B store={store2} /> }
      }

      const mapStateToPropsB = sinon.spy(state => ({ count: state.count }));
      @connect(mapStateToPropsB)
      class B extends Component {
        render() { return <C {...this.props} /> }
      }

      const mapStateToPropsC = sinon.spy(state => ({ count: state.count }));
      @connect(mapStateToPropsC)
      class C extends Component {
        render() { return <D /> }
      }

      const mapStateToPropsD = sinon.spy(state => ({ count: state.count }));
      @connect(mapStateToPropsD)
      class D extends Component {
        render() { return <div>{this.props.count}</div> }
      }

      TestUtils.renderIntoDocument(<RootMock store={store1} tanokStream={tanokStream1}><A /></RootMock>)
      expect(mapStateToPropsB.callCount).toBe(1)
      expect(mapStateToPropsC.callCount).toBe(1)
      expect(mapStateToPropsD.callCount).toBe(1)

      tanokStream1.send('inc');
      expect(mapStateToPropsB.callCount).toBe(1)
      expect(mapStateToPropsC.callCount).toBe(1)
      expect(mapStateToPropsD.callCount).toBe(2)

      tanokStream2.send('inc');
      expect(mapStateToPropsB.callCount).toBe(2)
      expect(mapStateToPropsC.callCount).toBe(2)
      expect(mapStateToPropsD.callCount).toBe(2)
    })
  })
})
