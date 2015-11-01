import tanok from '../../tanok.js';
import {init, update, Counter} from './counter.js';

let div = document.createElement('div');
document.body.appendChild(div);
tanok(init(), update, Counter, div);
