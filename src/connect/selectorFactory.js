import shallowEqual from './utils/shallowEqual'

function strictEqual(a, b) { return a === b }

export function pureFinalPropsSelectorFactory(
  mapStateToProps,
  mapSendToProps,
  mergeProps,
  send
) {
  const areStatesEqual = strictEqual;
  const areOwnPropsEqual = shallowEqual;
  const areStatePropsEqual = shallowEqual;
  let hasRunAtLeastOnce = false
  let state
  let ownProps
  let stateProps
  let sendProps
  let mergedProps

  function handleFirstCall(firstState, firstOwnProps) {
    state = firstState
    ownProps = firstOwnProps
    stateProps = mapStateToProps(state, ownProps)
    sendProps = mapSendToProps(send, ownProps)
    mergedProps = mergeProps(stateProps, sendProps, ownProps)
    hasRunAtLeastOnce = true
    return mergedProps
  }

  function handleNewPropsAndNewState() {
    stateProps = mapStateToProps(state, ownProps)

    if (mapSendToProps.dependsOnOwnProps)
      sendProps = mapSendToProps(send, ownProps)

    mergedProps = mergeProps(stateProps, sendProps, ownProps)
    return mergedProps
  }

  function handleNewProps() {
    if (mapStateToProps.dependsOnOwnProps)
      stateProps = mapStateToProps(state, ownProps)

    if (mapSendToProps.dependsOnOwnProps)
      sendProps = mapSendToProps(send, ownProps)

    mergedProps = mergeProps(stateProps, sendProps, ownProps)
    return mergedProps
  }

  function handleNewState() {
    const nextStateProps = mapStateToProps(state, ownProps)
    const statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps)
    stateProps = nextStateProps
    
    if (statePropsChanged)
      mergedProps = mergeProps(stateProps, sendProps, ownProps)

    return mergedProps
  }

  function handleSubsequentCalls(nextState, nextOwnProps) {
    const propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps)
    const stateChanged = !areStatesEqual(nextState, state)
    state = nextState
    ownProps = nextOwnProps

    if (propsChanged && stateChanged) return handleNewPropsAndNewState()
    if (propsChanged) return handleNewProps()
    if (stateChanged) return handleNewState()
    return mergedProps
  }

  return function pureFinalPropsSelector(nextState, nextOwnProps) {
    return hasRunAtLeastOnce
      ? handleSubsequentCalls(nextState, nextOwnProps)
      : handleFirstCall(nextState, nextOwnProps)
  }
}


// If pure is true, the selector returned by selectorFactory will memoize its results,
// allowing connect's shouldComponentUpdate to return false if final
// props have not changed. If false, the selector will always return a new
// object and shouldComponentUpdate will always return true.

export default function finalPropsSelectorFactory(send, {
  initMapStateToProps,
  initMapSendToProps,
  initMergeProps,
}) {
  const mapStateToProps = initMapStateToProps(send);
  const mapSendToProps = initMapSendToProps(send);
  const mergeProps = initMergeProps(send);

  return pureFinalPropsSelectorFactory(
    mapStateToProps,
    mapSendToProps,
    mergeProps,
    send
  )
}
