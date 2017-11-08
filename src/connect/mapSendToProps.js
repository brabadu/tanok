import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrapMapToProps'

export function whenMapSendToPropsIsFunction(mapSendToProps) {
  return (typeof mapSendToProps === 'function')
    ? wrapMapToPropsFunc(mapSendToProps)
    : undefined
}

export function whenMapSendToPropsIsMissing(mapSendToProps) {
  return (!mapSendToProps)
    ? wrapMapToPropsConstant(send => ({ send }))
    : undefined
}


export default [
  whenMapSendToPropsIsFunction,
  whenMapSendToPropsIsMissing,
]
