import {BeruangNodeResolver} from './beruang-node-resolver.js';

export const BeruangTemplate = (base) =>
class extends BeruangNodeResolver(base) {
  constructor() {
    super();
  }
}
