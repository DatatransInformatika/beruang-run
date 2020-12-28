export const BeruangArray = (base) =>
class extends base {

  constructor() {
    super();
  }

  push(path, ...items) {
    let objFld = this._getObjField(path);
    if(!objFld) {
      return;
    }
    let arr = objFld.fld ? objFld.obj[objFld.fld] : objFld.obj;
    let startIdx = arr.length;
    items.forEach((item, i) => {
      arr.push(item);
    });
    this.view.arrayPush(objFld.prop, startIdx, items.length, arr);
  }

}
