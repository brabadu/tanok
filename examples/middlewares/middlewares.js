export function loggingMiddleware(index) {
    return (stream) => (next) => (state) => {
        console.log(`Before ${index}`);
        console.log('State: ', state);
        const actionResult = next(state);
        console.log(`After ${index}`);
        console.log('State: ', actionResult.state);
        console.log('Effects: ', actionResult.effects);
        console.log('Params: ', actionResult.params);
        return actionResult;
    }
}

export function tracingMiddleware() {
  return (stream) => (next) => (state) => {
    console.log(`Before`);
    const actionResult = next(state);

    const tracingId = actionResult.params.tracingId || Math.random() * 1000;
    console.log(`Tracing ${tracingId}`);
    const cloneStream = Object.assign(
      Object.create(Object.getPrototypeOf(stream)), stream);
    cloneStream.getStreamOriginalPayload = cloneStream.getStreamPayload;
    cloneStream.getStreamPayload = (action, payload) => {
      return {
        ...cloneStream.getStreamOriginalPayload(action, payload),
        tracingId,
      }
    };

    console.log(`After`);
    actionResult.effects = actionResult.effects.map(
      (effect) => (innerStream) => {
        const shutdownActionsBefore = cloneStream.shutdownActions;
        const result = effect(cloneStream);
        const shutdownActionsAfter = cloneStream.shutdownActions;
        const diff = shutdownActionsAfter.filter(
          (i) => shutdownActionsBefore.indexOf(i) < 0
        );
        stream.shutdownActions.push.apply(stream.shutdownActions, diff);
        return result;
      }
    );
    return actionResult;
  }
}