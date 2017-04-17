# Changelog

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
