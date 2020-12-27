import {BeruangPresenter} from '../beruang/mvp/beruang-presenter.js';
import {SampleViewFactory} from './sample-view-factory.js';

class SamplePresenter extends BeruangPresenter(HTMLElement) {

  constructor() {
    super(SampleViewFactory);
  }

  static get properties() {
    return {
      func: {
        type:String,
        value:()=>'jkl'
      },

      label:{
        type:String,
        value:'Abdul Yadi',
        observer:'_labelChanged'
      },

      address:{
        type:String,
        value:'Batam'
      },

      show: {
        type:Boolean,
        value:false
      },

      simpleArray: {
        type:Array,
        value:()=>[1,2,3]
      },

      personArray: {
        type:Array,
        value:()=>[
          {'name':'Abdul'},
          {'name':'Cicit'},
          {'name':'Moni'}
        ]
      },
    }
  }

  _labelChanged(newVal, oldVal) {
    //console.log(newVal, oldVal);
  }
}

window.customElements.define('sample-presenter', SamplePresenter);
