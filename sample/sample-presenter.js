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
        observer:'labelChanged'
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

      student: {
        type:Object,
        value:()=>{
          return {
            'subject':'Math',
            'mark':'A'
          }
        }
      },

      nestedArray: {
        type:Array,
        value:()=>[
          {'label':'A', 'sub':[{'sub1':'A-Sub1','sub2':'A-Sub2'},{'sub1':'Z-Sub1','sub2':'Z-Sub2'}]},
          {'label':'B', 'sub':[{'sub1':'B-Sub1','sub2':'B-Sub2'}]},
          {'label':'C', 'sub':[{'sub1':'C-Sub1','sub2':'C-Sub2'}]}
        ]
      }
    }
  }

  labelChanged(newVal, oldVal) {
    //console.log(newVal, oldVal);
  }
}

window.customElements.define('sample-presenter', SamplePresenter);
