// Sets a poster's height from the ?ratio= URL parameter so one template serves every print format.
// Width stays 794 px; height = 794 × ratio. Exposes --k (height scale vs. the original A4 design)
// and --f (letter scale, never above 1) to the poster's CSS.
window.POSTER_RATIOS = {
  iso: Math.SQRT2, // A5 … A0
  '5x7': 7 / 5,    // 50×70 cm, 5×7 in
  '2x3': 3 / 2,    // 20×30, 40×60, 60×90 cm, 24×36 in
  '3x4': 4 / 3,    // 30×40, 45×60 cm, 18×24 in
  '4x5': 5 / 4     // 40×50 cm, 8×10, 16×20 in
};

document.addEventListener('DOMContentLoaded', function () {
  var poster = document.querySelector('.poster');
  if (!poster) return;
  var key = new URLSearchParams(location.search).get('ratio') || 'iso';
  var ratio = window.POSTER_RATIOS[key] || window.POSTER_RATIOS.iso;
  var height = 794 * ratio;
  var designHeight = Number(poster.dataset.designHeight || 1123);
  var frame = Number(poster.dataset.frame || 0); // fixed margins that don't stretch
  var k = (height - frame) / (designHeight - frame);
  poster.style.height = height + 'px';
  poster.style.setProperty('--k', k);
  poster.style.setProperty('--f', Math.min(k, 1));
  poster.dataset.ratio = key;
});
