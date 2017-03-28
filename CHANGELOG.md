# Changelog

## 1.0

### Breaking
*  Field `StreamWrapper.parent` was renamed to `StreamWrapper.streamName` in  and in messages that `StreamWrapper.send` pushes to stream
* Removed `meta` parameter from `StreamWrapper.send`, now it is passed to `TanokComponent.sub(name, metadata)`
* Signature for `effectWrapper` is also changed and now can get metadata to pass it to dispatcher

### Other
* Updated rollup version for building
* Changed react peerDependency to `*`
