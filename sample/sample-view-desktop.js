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
Desktop [[_large (123, label, ADUH)]] at [[address]]
once more [[_large(123, label, ADUH)]]</b>
    <slot></slot>
    <template data-switch="!show">cond [[address]] <div>conditional [[label]]</div></template>
    <template data-array="simpleArray" data-tmpl-item="n" data-tmpl-index="i">
    <div>[[i]] [[n]] [[_plusTen(i)]]</div>
    </template>
    <template data-array="personArray" data-tmpl-item="p" data-tmpl-index="j">
      <div>[[j]] [[p.name]]</div>
      <template data-switch="show">cond [[address]] <div>conditional [[label]]</div></template>
    </template>
    <div>[[student.subject]] [[student.mark]]</div>
    <template data-switch="show">
      <template data-array="nestedArray" data-tmpl-item="p" data-tmpl-index="j">
        <div>[[j]] [[p.label]]</div>
        <template data-array="p.sub" data-tmpl-item="q" data-tmpl-index="k">
          <div>[[k]] [[q.sub1]] [[q.sub2]]</div>
        </template>
      </template>
    </template>
    `;
  }

  _large(n, s, t) {
    return t + ' ' + n + ' ' + s.toUpperCase();
  }

  _plusTen(n) {
    return n + 10;
  }

}

export {SampleView};
