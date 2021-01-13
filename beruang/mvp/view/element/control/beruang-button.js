import {BeruangElement} from '../beruang-element.js'
import {BeruangStyleParser} from '../../nodeparser/beruang-style-parser.js';
import {BeruangTextParser} from '../../nodeparser/beruang-text-parser.js';
import {BeruangSwitchParser} from '../../nodeparser/beruang-switch-parser.js';
import {BeruangElementParser} from '../../nodeparser/beruang-element-parser.js';
import '../../style/beruang-layout.js';
import '../../style/beruang-font.js';

class BeruangButton extends BeruangElementParser(BeruangSwitchParser(BeruangTextParser(BeruangStyleParser(BeruangElement)))) {

  constructor() {
    super();
  }

  static get template() {
    return `
    <style include="beruang-theme beruang-layout">
    :host {
      @apply --layout-inline;
      @apply --layout-justify-center;
      @apply --layout-align-center;
      @apply --ctrl-font;      
      min-width:64px;
      min-height:36px;
      background-color:var(--primary-light-color);
      color:var(--primary-text-color);
      padding:16px;
      text-transform:uppercase;
      text-align:center;
      box-sizing:border-box;
      border-radius:5px;
      cursor:pointer;
    }

    :host([has-icon]) {
      padding:16px 16px 16px 12px;
    }

    :host([has-icon]) > beruang-icon {
      width:var(--ctrl-icon-size);
      height:var(--ctrl-icon-size);
      margin-right:8px;
    }
    </style>
    <template data-switch="hasIcon"><beruang-icon icon=[[icon]]></beruang-icon>[[label]]</template>
    <template data-switch="!hasIcon">[[label]]</template>`;
  }

  static get properties() {
    return {
      icon: {
        type:String,
        value:'',
        observer:'_onIcon'
      },

      hasIcon: {
        type:Boolean,
        value:false,
        reflectToAttribute:true
      },

      label:{
        type:String,
        value:''
      }
    };
  }

  _onIcon(newVal, oldVal) {
    this.hasIcon = !!newVal;
  }

}

window.customElements.define('beruang-button', BeruangButton);
