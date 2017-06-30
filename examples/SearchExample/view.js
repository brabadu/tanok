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
                    {this.props.repos.map((repo) => <li>{repo.name} {repo.stargazers_count} stars</li>)}
                </ul>
            </div>
        )
    }
}