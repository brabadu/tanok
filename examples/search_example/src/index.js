import { tanok } from 'tanok';

import { SearchDispatcher } from './dispatcher';
import { SearchModel } from './model';
import { SearchComponent } from './view';

tanok(new SearchModel(), new SearchDispatcher(), SearchComponent, {
  container: document.getElementById('root'),
});
