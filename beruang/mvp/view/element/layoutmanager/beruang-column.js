import {BeruangElement} from '../beruang-element.js'
import {BeruangStyleParser} from '../../nodeparser/beruang-style-parser.js';
import '../../style/beruang-layout.js'

class BeruangColumn extends BeruangStyleParser(BeruangElement) {
  constructor() {
    super();
  }

  static get template() {
    return `
    <style include="beruang-layout">
    :host {
      display:block;
      background-color:green;
      @apply --layout-column;
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

window.customElements.define('beruang-column', BeruangColumn);
