import {BeruangView} from '../beruang/mvp/view/beruang-view.js';
import '../beruang/mvp/view/style/beruang-layout.js';
import {BeruangStyleParser} from '../beruang/mvp/view/nodeparser/beruang-style-parser.js';
import {BeruangElementParser} from '../beruang/mvp/view/nodeparser/beruang-element-parser.js';
import {BeruangTextParser} from '../beruang/mvp/view/nodeparser/beruang-text-parser.js';
import {BeruangSwitchParser} from '../beruang/mvp/view/nodeparser/beruang-switch-parser.js';
import {BeruangArrayParser} from '../beruang/mvp/view/nodeparser/beruang-array-parser.js';

class SampleView extends BeruangView(
  BeruangStyleParser(
    BeruangElementParser(
      BeruangTextParser(
        BeruangSwitchParser(
          BeruangArrayParser(Object)
        )
      )
    )
  )
) {

  constructor() {
    super();
  }

  static get template() {
    return `
    <style include="beruang-layout  beruang-other">
    :host {
      font-size:20px;
      font-weight:bold;
      --button-color:blue;
      --blue-button:{
        color:var(--button-color);
        font-size:30px;
      }
    }

    :host button {
      @apply --blue-button;
    }

    :host > input {
      color:green;
    }

    :host([my-ctrl=button][my-clr=yellow]) button {
      color:yellow;
    }

    :host::part(alert) {
      color:red;
    }
    </style>
<input value="[[label:input]]"></input>
<button on-hit="hit">click [[label]]</button>
    <div><div part='alert'>ABC</div></div>
[[address]]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>[[label]]
Desktop [[large (123, label, ADUH)]] at [[address]]
once more [[large(123, label, ADUH)]]</b>
    <slot></slot>
    <br>
    <br>
    <template data-switch="!show">cond [[address]] <div>conditional [[label]]</div></template>
    <br>

    <div>simpleArray size: [[arrayLen(simpleArray)]]
      <div>simpleArray size 2: [[arrayLen(simpleArray)]]</div>
    </div>

    <template data-array="simpleArray" data-item="n" data-index="i">
    <input check value="[[n:input]]"></input>
    <div>[[label]] [[i]] [[n]] [[plusTen(i)]]</div>
    </template>
    <br>
    <br>

    <template data-array="personArray" data-item="p" data-index="j">
      <div>[[j]] [[p.name]]</div>
      <template data-switch="show">cond [[address]] <div>conditional [[label]]</div></template>
    </template>

    <div>[[student.subject]] [[student.mark]]</div>
    <template data-switch="show">
      <template data-array="nestedArray" data-item="p" data-index="j">
        <div>[[j]] [[p.label]]</div>
        <div>p.sub array size: [[arrayLen(p.sub)]]</div>
        <template data-array="p.sub" data-item="q" data-index="k">
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
