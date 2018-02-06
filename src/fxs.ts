import { StreamWrapper } from './streamWrapper';

export function rethrowFx(action: string, payload?: object) {
  return function (stream: StreamWrapper) {
    stream.send(action, payload)
  }
}

export function subcomponentFx(subName: string, dispatchSub) {
  return function (stream: StreamWrapper) {
    stream.subStream(subName, dispatchSub)
  }
}

export function childFx(effect, streamName, metadata = null ) {

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
