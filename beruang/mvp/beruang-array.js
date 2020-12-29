export const BeruangArray = (base) =>
class extends base {

  constructor() {
    super();
  }

  push(path, ...items) {//return new array length
    let objFld = this._getObjField(path);
    if(!objFld) {
      return;
    }
    let arr = objFld.fld ? objFld.obj[objFld.fld] : objFld.obj;
    let startIdx = arr.length;
    items.forEach((item, i) => {
      arr.push(item);
    });
    this.view.arrayPush(objFld.prop, startIdx, items.length);
    return arr.length;
  }

  splice(path, index, removeCount, ...items) {//return removed count
    let objFld = this._getObjField(path);
    if(!objFld) {
      return;
    }
    let arr = objFld.fld ? objFld.obj[objFld.fld] : objFld.obj;
    let len0 = arr.length;
    for(let i=0; i<removeCount; i++) {
      arr.splice(index, 1);
    }
    let removes = len0 - arr.length;
    let pushIdx = index;
    items.forEach((item, i) => {
      arr.splice(pushIdx++, 0, item);
    });
    this.view.arraySplice(objFld.prop, index, items.length, removeCount);
    return removes;
  }

}
