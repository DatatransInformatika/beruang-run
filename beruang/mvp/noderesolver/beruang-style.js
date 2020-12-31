class BeruangStyle {

  constructor() {}

  parse(node) {

/*    :host { <key>
      font-size:20px; <item0 key:value>
      font-weight:bold; <item1 key:value>
      @apply --layout-vertical; <expand0 key:value>
      color:var(--lightgray);
      --wordwrap: {  <term0: key:[list-of-item]>
        white-space: normal; <term0[--wordwrap]: key:list-of-item>
        overflow: hidden;
        text-overflow:clip;
        word-wrap:break-word;
        @apply --small-font;
        color:var(--red);
		  }
    }

[
  0:{
    'key':':host'
    'rule':[
      0:{'type':'fixed','key':'font-size','val':'20px'}
      1:{'type':'fixed','key':'font-weight','val':'bold'}
      2:{'type':'apply','val':'--layout-vertical'}
      3:{'type':'var','key':'color','val':':var(--lightgray)'}
      4:{'type':'rule','key':'--wordwrap',
        'rule':[
          0:{'type':'item','key':'white-space','val':'normal','symbol':false},
          1:{'type':'item','key':'overflow','val':'hidden','symbol':false},
          2:{'type':'item','key':'text-overflow','clip','symbol':false},
          3:{'type':'item','key':'word-wrap:break-word'},
          4:{'type':'apply','val':'--small-font'},
          5:{'type':'var','key':'color','val':':var(--red)}'
        ]}
    ]
  }
]
*/
  //step 1: parse text into object
  //collect external variable



    //let obj;
    //let s = Array.from(node.textContent);//.toCharArray();




    //let s = [...node.textContent];

    //console.log(s);
    /*node.textContent.toCharArray().forEach((c, i) => {
      console.log(c);
    });*/

  }

}

export {BeruangStyle};
