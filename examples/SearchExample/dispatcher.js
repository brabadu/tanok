import Rx from 'rx';
import { on, TanokDispatcher, rethrowFx } from  '../../lib/tanok.js';
import * as action from './actions';

function searchRepos(searchTerm) {
    return (stream) => {
        Rx.Observable.fromPromise(
          fetch(`https://api.github.com/search/repositories?q=${searchTerm || 'tanok'}`)
        )
        .flatMap((r) => r.json())
        .do(() => console.log('pre', searchTerm))
        .takeUntil(stream.stream.filter(({action: dispatchedAction}) => dispatchedAction === action.CANCEL_SEARCH))
        .do(() => console.log('post', searchTerm))
        .do(({ items }) => stream.send(action.SEARCH_OK, { items }))
    }
}

function cancelSearch(stream) {
    stream.send(action.CANCEL_SEARCH);
}

export class SearchDispatcher extends TanokDispatcher {
    @on(action.INIT)
    init(_, state) {
        return [state, rethrowFx(action.SEARCH)]
    }

    @on(action.INPUT_TERM)
    inputTerm({ term }, state) {
        state.searchTerm = term;
        return [state, rethrowFx(action.SEARCH)]
    }

    @on(action.SEARCH)
    search(_, state) {
        return [state, cancelSearch, searchRepos(state.searchTerm)]
    }

    @on(action.SEARCH_OK)
    searchOk({ items }, state) {
        state.repos = items;
        return [state]
    }
}
