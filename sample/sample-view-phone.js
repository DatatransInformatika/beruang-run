import {BeruangView} from '../beruang/mvp/view/beruang-view.js';

class SampleView extends BeruangView(Object) {
  constructor() {
    super();
  }

  static get template() {
    return `<style>:host {font-size:20px;font-weight:bold;}</style>
      <b>Phone, I'm in shadow dom from beruang-viewfactory!</b>
      <slot></slot>`;
  }

}

export {SampleView};
