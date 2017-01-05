export function loggingMiddleware(index) {
    return (action) => (state) => {
        console.log(`Before ${index}`);
        console.log('State: ', state);
        const actionResult = action(state);
        console.log(`After ${index}`);
        console.log('State: ', actionResult.state);
        console.log('Effects: ', actionResult.effects);
        console.log('Params: ', actionResult.params);
        return actionResult;
    }
}