import {BeruangElement} from '../beruang-element.js'
import {BeruangStyleParser} from '../../nodeparser/beruang-style-parser.js';

class BeruangButton extends BeruangStyleParser(BeruangElement) {

  constructor() {
    super();
  }

  static get template() {
    return `
    <style include="beruang-theme">
    </style>
    <slot></slot>`;
  }

}

window.customElements.define('beruang-button', BeruangButton);
