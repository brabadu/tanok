import { tanok } from 'tanok';

import { CounterDispatcher } from "./dispatcher";
import { initModel } from "./model";
import { Counter } from "./view";


tanok(initModel(), new CounterDispatcher(), Counter, {
  container: document.getElementById('root'),
});
