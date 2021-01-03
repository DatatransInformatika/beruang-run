import {BeruangElement} from '../beruang-element.js'

class BeruangFit extends BeruangElement(HTMLElement) {
  constructor() {
    super();
  }

  static get template() {
    return `
    <style>
    :host {
      position:absolute;
      top:0px;
      right:0px;
      bottom:0px;
      left:0px;
      background-color:red;
    }
    </style>
    <slot></slot>`;
  }
}

window.customElements.define('beruang-fit', BeruangFit);
