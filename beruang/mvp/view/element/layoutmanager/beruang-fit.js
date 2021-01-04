import {BeruangElement} from '../beruang-element.js';
import {BeruangStyleParser} from '../../nodeparser/beruang-style-parser.js';
import '../../style/beruang-layout.js';

class BeruangFit extends BeruangStyleParser(BeruangElement) {
  constructor() {
    super();
  }

  static get template() {
    return `
    <style include="beruang-layout">
    :host {
      @apply --layout-fit;
      background-color:red;
    }
    </style>
    <slot></slot>`;
  }
}

window.customElements.define('beruang-fit', BeruangFit);
