import {BeruangElement} from '../beruang-element.js'
import {BeruangStyleParser} from '../../nodeparser/beruang-style-parser.js';
//import '../../style/beruang-layout.js'

class BeruangRow extends BeruangElement(BeruangStyleParser(HTMLElement)) {
  constructor() {
    super();
  }

  static get template() {
    return `
    <style>
    :host {
      display:block;
    }
    :host([fit]) {

    }
    </style>
    <slot></slot>`;
  }
}

window.customElements.define('beruang-row', BeruangRow);
