(function() {
  const template = document.createElement('template');
  template.innerHTML = `
<style>
:host {
--layout-fit: {
  position:absolute;
  top:0px;
  right:0px;
  bottom:0px;
  left:0px;
};

--layout-inline: {
  display:-ms-inline-flexbox;
  display:-webkit-inline-flex;
  display:inline-flex;
};

--layout-flex: {
  display:-ms-flexbox;
  display:-webkit-flex;
  display:flex;
};

--layout-row: {
  @apply --layout-flex;
  -ms-flex-direction:row;
  -webkit-flex-direction:row;
  flex-direction:row;
};

--layout-column: {
  @apply --layout-flex;
  -ms-flex-direction:column;
  -webkit-flex-direction:column;
  flex-direction:column;
};

--layout-justify-center: {
  -ms-flex-pack:center;
  -webkit-justify-content:center;
  justify-content:center;
};

--layout-align-center: {
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
};

}
</style>`;

class BeruangLayout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

window.customElements.define('beruang-layout', BeruangLayout);
})();
