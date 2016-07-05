export function loggingMiddleware(data) {
    console.log('State: ', data.state);
    console.log('Effects: ', data.effects);
    console.log('Params: ', data.params);
    return data;
}