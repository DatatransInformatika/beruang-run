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
<input value="[[label:input]]"></input>
<button on-hit="hit">click [[label]]</button>
    <div><div>ABC</div></div>
[[address]]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[[label]]
Desktop [[large (123, label, ADUH)]] at [[address]]
once more [[large(123, label, ADUH)]]</b>
    <slot></slot>
    <template data-switch="!show">cond [[address]] <div>conditional [[label]]</div></template>
    <div>simpleArray size: [[arrayLen(simpleArray)]]
      <div>simpleArray size 2: [[arrayLen(simpleArray)]]</div>
    </div>
    <template data-array="simpleArray" data-item="n" data-index="i">
    <input check value="[[n:input]]"></input>
    <div>[[label]] [[i]] [[n]] [[plusTen(i)]]</div>
    </template>
    <template data-array="personArray" data-item="p" data-index="j">
      <input check value="[[p.name:input]]"></input>
      <div>[[j]] [[p.name]]</div>
      <template data-switch="show">cond [[address]] <div>conditional [[label]]</div></template>
    </template>
    <div>[[student.subject]] [[student.mark]]</div>
    <template data-switch="show">
      <template data-array="nestedArray" data-item="p" data-index="j">
        <div>[[j]] [[p.label]]</div>
        <div>p.sub array size: [[arrayLen(p.sub)]]</div>
        <template data-array="p.sub" data-item="q" data-index="k">
          <input check value="[[q.sub1:input]]"></input>
          <div>[[k]] [[q.sub1]] [[q.sub2]]</div>
        </template>
      </template>
    </template>
    `;
  }

  large(n, s, t) {
    return t + ' ' + n + ' ' + s.toUpperCase();
  }

  plusTen(n) {
    return n + 10;
  }

  arrayLen(arr) {
    return arr ? arr.length : 0;
  }

  hit(e) {
    console.log('hit');
  }
}

export {SampleView};
