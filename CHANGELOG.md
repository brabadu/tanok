# Changelog

## 2.0.0
* *BREAKING* Changed signatures for middlwares, so now they may receive `streamWrapper` #28
* *BREAKING* Changed signature for `makeStreamState`, passing only `streamWrapper` instead of `eventStream` #30
* *BREAKING* Removed `TanokComponent` prop `eventStream` as alternative name to `tanokStream` #37
* *BREAKING* Removed `TanokComponent.subStream` as alternative name to `tanokStream` #37
* Introducing `connect`, stores and all this redux madness #34
* Moved docs to http://tanok.js.org/ #31 #32
* Added check for test coverage #29
* Reorganized examples #33


## 1.3.0
* Added shutdown behavior to `streamWrapper` that allows graceful shutdown of app #26

## 1.2.3
* Fixed corrupting initial state type in TanokInReact

## 1.2.2
* Check for return value of effect, `flatMap` it only if it's Promise or Observable.
* Fixes to `TanokInReact` HOC

## 1.2.1
* Removed `effectBus` as it is actually not needed
* Fixed name collision in `on` decorator

## 1.2.0

* All effects are passed through one effects bus, this allows effect cancelation
* Fixed `TanokDispatcher` inheritance bug, which caused multiple call of `init`
* `tanok` function now also returns `streamWrapper` and `shutdown` function, that allows graceful shutdown of your tanok instance
* Extracted `makeStreamState` and `streamWithEffects` out of `tanok` function.
* Added new React HOC `TanokInReact` which allows to run complete tanok app inside simple React component
* Dropped `create-react-class` package in favor of React.Component class-based Root
* Using `es2015-loose` preset for building tanok


## 1.1.0

* Create less files in rollup build, as most of them are never used as separate things
* Renamed `effectWrapper` to `childFx`
* Grouped all built-in effects in `fxs.js`
* Moved `TanokDispatcher` base class out of `core.js` module


## 1.0

### Breaking
*  Field `StreamWrapper.parent` was renamed to `StreamWrapper.streamName` in  and in messages that `StreamWrapper.send` pushes to stream
* Removed `meta` parameter from `StreamWrapper.send`, now it is passed to `TanokComponent.sub(name, metadata)`
* Signature for `effectWrapper` is also changed and now can get metadata to pass it to dispatcher

### Other
* Updated rollup version for building
* Changed react peerDependency to `*`
