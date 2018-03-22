export function rethrowFx(action, payload) {
  return function (stream) {
    stream.send(action, payload)
  }
}

export function subcomponentFx(subName, dispatchSub) {
  return function (stream) {
      stream.subStream(subName, dispatchSub);
  }
}

export function childFx(effect, streamName, metadata = null) {
  return (streamWrapper) => {
      const substream = streamWrapper.subWithMeta(streamName, metadata);
      return effect
          ? effect(substream)
          : Rx.helpers.noop;
  };
}
