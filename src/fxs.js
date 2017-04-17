export function rethrowFx(action, payload) {
  return function (stream) {
    stream.send(action, payload)
  }
}

export function subcomponentFx(subName, dispatchSub) {
  return function (stream) {
    stream.subStream(subName, dispatchSub)
  }
}

export function childFx(effect, streamName, metadata = null) {
  return (streamWrapper) => {
    let substream;
    if (metadata !== null) {
      substream = streamWrapper.subWithMeta(streamName, metadata);
    } else {
      substream = streamWrapper.subs[streamName];
    }
    if (!substream) {
      throw new Error(`No such substream '${streamName}'`)
    }

    return effect
      ? effect(substream)
      : Rx.helpers.noop;
  };
}
