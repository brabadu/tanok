import { counterInit } from './counter/model';

export function initModel() {
  return {
    counters: Array.from({length: 10}).map((_, ind) => counterInit(ind)),
  };
}