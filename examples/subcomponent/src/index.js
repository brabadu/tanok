import { tanok } from 'tanok';

import { DashboardDispatcher } from "./dispatcher";
import { initModel } from "./model";
import { TwoCounters } from "./view";


tanok(initModel(), new DashboardDispatcher(), TwoCounters, {
  container: document.getElementById('root'),
});
