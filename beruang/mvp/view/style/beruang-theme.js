(function() {
  switch(window.theme) {
    case 'beruang-tropic':
      import('./theme/beruang-tropic.js').then((module) => {});
      break;
    case 'beruang-polar':
    default:
      import('./theme/beruang-polar.js').then((module) => {});
      break;
  }
})();
