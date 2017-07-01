import React from 'react';
import { tanokComponent } from '../../lib/tanok';
import * as action from './actions';

@tanokComponent
export class SearchComponent extends React.Component {
    render() {
        return (
            <div>
                <input
                    value={this.props.searchTerm}
                    onChange={(e) => {
                        this.send(action.INPUT_TERM, { term: e.target.value })
                    }}
                />
                <ul>
                    {this.props.repos
                      ? this.props.repos.map((repo) => <li key={repo.name}>{repo.name} {repo.stargazers_count} stars</li>)
                      : 'Failed to load anything'
                    }
                </ul>
            </div>
        )
    }
}
