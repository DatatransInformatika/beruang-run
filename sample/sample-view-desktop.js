import {BeruangView} from '../beruang/mvp/beruang-view.js';

class SampleView extends BeruangView(Object) {

  constructor() {
    super();
  }

  static getTemplate() {
    return `
    <style>
    :host {
      font-size:20px;
      font-weight:bold;
    }
    </style>
    <div><div>ABC</div></div>
[[address]]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[[label]]
Desktop [[_large(123, label, ADUH)]] at [[address]]
once more [[_large(123, label, ADUH)]]</b>
    <slot></slot>`;
  }

  _large(n, s, t) {
    return t + ' ' + n + ' ' + s.toUpperCase();
  }

}

export {SampleView};
