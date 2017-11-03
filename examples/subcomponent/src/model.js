import { counterInit } from './counter/model';

export function initModel() {
  return {
    top: counterInit('top'),
    bottom: counterInit('bottom'),
  }
}