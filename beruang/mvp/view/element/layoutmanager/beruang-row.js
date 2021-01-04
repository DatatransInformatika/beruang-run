import {BeruangElement} from '../beruang-element.js'
import {BeruangStyleParser} from '../../nodeparser/beruang-style-parser.js';
import '../../style/beruang-layout.js'

class BeruangRow extends BeruangStyleParser(BeruangElement) {
  constructor() {
    super();
  }

  static get template() {
    return `
    <style include="beruang-layout">
    :host {
      display:block;
      background-color:green;
    }
    :host([fit-parent]) {
      @apply --layout-fit;
      @apply --layout-row;
    }
    </style>
    <slot></slot>`;
  }

  static get properties() {
    return {
      fitParent: {
        type:Boolean,
        value:true,
        reflectToAttribute:true
      }
    }
  }
}

window.customElements.define('beruang-row', BeruangRow);
