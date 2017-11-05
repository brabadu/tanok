export function defaultMergeProps(stateProps, sendProps, ownProps) {
  return { ...ownProps, ...stateProps, ...sendProps }
}

export function wrapMergePropsFunc(mergeProps) {
  return function initMergePropsProxy() {
    let hasRunOnce = false
    let mergedProps

    return function mergePropsProxy(stateProps, sendProps, ownProps) {
      const nextMergedProps = mergeProps(stateProps, sendProps, ownProps)

      if (!hasRunOnce) {
        hasRunOnce = true
        mergedProps = nextMergedProps
      }

      return mergedProps
    }
  }
}

export function whenMergePropsIsFunction(mergeProps) {
  return (typeof mergeProps === 'function')
    ? wrapMergePropsFunc(mergeProps)
    : undefined
}

export function whenMergePropsIsOmitted(mergeProps) {
  return (!mergeProps)
    ? () => defaultMergeProps
    : undefined
}

export default [
  whenMergePropsIsFunction,
  whenMergePropsIsOmitted
]
