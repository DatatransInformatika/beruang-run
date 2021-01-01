import {BeruangViewFactory} from '../beruang/mvp/view/beruang-view-factory.js';

class SampleViewFactory extends BeruangViewFactory(Object) {

  /*override parent abstract method*/
  static getViewClsName() {
      return 'SampleView';
  }

  /*override parent abstract method*/
  static getViewJs(formfactor) {
    let src;
    switch(formfactor) {
      case 'phone':
      case 'table':
        src = '/beruang/sample/sample-view-phone.js';
        //src = '/beruang/sample/sample-view-desktop.js';
        break;
      case 'desktop':
      default:
        src = '/beruang/sample/sample-view-desktop.js';
        break;
    }
    return src;
  }

}

export {SampleViewFactory};
