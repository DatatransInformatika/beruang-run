(function() {
  const template = document.createElement('template');
  template.innerHTML = `
<style>
:host {
--primary-color:#1976d2;
--primary-light-color:#63a4ff;
--primary-dark-color:#004ba0;
--primary-text-color:#ffffff;
--ctrl-icon-size:18px;
--ctrl-font: {
  font-family:Roboto;
  font-size:0.875rem;
  font-weight:500;
  letter-spacing: .0892857143em;
};
}
</style>`;

class BeruangTropic extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

window.customElements.define('beruang-theme', BeruangTropic);
})();
