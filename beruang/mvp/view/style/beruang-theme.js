(function() {
  if(window.theme==='beruang-tropic') {
    import('./theme/beruang-tropic.js').then((module) => {});
  } else if(window.theme==='beruang-polar') {
    import('./theme/beruang-polar.js').then((module) => {});
  }
})();
