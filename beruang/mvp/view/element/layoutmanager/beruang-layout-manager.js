import {BeruangElement} from '../beruang-element.js'

class BeruangLayoutManager extends BeruangElement {
  constructor() {
    super();
  }

  static get template() {
    return `beruang-layout-manager`;
  }
}

window.customElements.define('beruang-layout-manager', BeruangLayoutManager);
