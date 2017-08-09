import React from 'react';
import {on, TanokDispatcher, childFx, subcomponentFx, rethrowFx, tanokComponent, SubComponent} from '../../lib/tanok.js';

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
    return [state, ...effects.map((e) => childFx(e, COLUMN, metadata))]
  }
}


@tanokComponent
export class TwoColumns extends React.Component {
  render() {
      return <table>
        <tbody>
        <tr>
          <td>
            <SubComponent
              name={COLUMN}
              metadata={LEFT}
            >
              <ColumnView key={LEFT} {...this.props[LEFT]} />
            </SubComponent>
          </td>
          <td>
            <SubComponent
              name={COLUMN}
              metadata={RIGHT}
            >
              <ColumnView key={RIGHT} {...this.props[RIGHT]} />
            </SubComponent>
          </td>
        </tr>
        </tbody>
      </table>
  }
}
