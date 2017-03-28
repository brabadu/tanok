import React from 'react';
import {on, TanokDispatcher, effectWrapper, subcomponentFx, rethrowFx, tanokComponent} from '../../lib/tanok.js';

import {init as initColumn,
        Dashboard as ColumnDispatcher, CountersCollection as ColumnView} from './subcomponents.js';

const COLUMN = 'column';
const LEFT = 'left';
const RIGHT = 'right';

export function init() {
  return {
    [LEFT]: initColumn(),
    [RIGHT]: initColumn(),
  }
}

export class Dashboard extends TanokDispatcher {
  @on('init')
  init(payload, state) {
    return [state,
      subcomponentFx(COLUMN, new ColumnDispatcher),
    ]
  }

  @on(COLUMN)
  columnChange(payload, state, {metadata}) {
    const [newState, ...effects] = payload(state[metadata]);
    state[metadata] = newState;
    return [state, ...effects.map((e) => effectWrapper(e, COLUMN, metadata))]
  }
}


@tanokComponent
export class TwoColumns extends React.Component {
  render() {
      return <table>
        <tbody>
        <tr>
          <td>
            <ColumnView key={LEFT} tanokStream={this.sub(COLUMN, LEFT)} {...this.props[LEFT]} />
          </td>
          <td>
            <ColumnView key={RIGHT} tanokStream={this.sub(COLUMN, RIGHT)} {...this.props[RIGHT]} />
          </td>
        </tr>
        </tbody>
      </table>
  }
}
