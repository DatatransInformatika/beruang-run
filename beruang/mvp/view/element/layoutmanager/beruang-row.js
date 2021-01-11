import {BeruangElement} from '../beruang-element.js'
import {BeruangStyleParser} from '../../nodeparser/beruang-style-parser.js';
import '../../style/beruang-layout.js'

class BeruangRow extends BeruangStyleParser(BeruangElement) {
  constructor() {
    super();
  }

  static get template() {
    return `
    <style include="beruang-theme beruang-layout">
    :host {
      display:block;
      background-color:var(--primary-color, red);
      @apply --layout-row;
    }
    :host([fit-parent]) {
      @apply --layout-fit;
    }
    </style>
    <slot></slot>`;
  }

  static get properties() {
    return {
      fitParent: {
        type:Boolean,
        value:false,
        reflectToAttribute:true
      }
    }
  }

}

window.customElements.define('beruang-row', BeruangRow);
