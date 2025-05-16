/* super-subtle rings (≈5 % opacity) */
window.addEventListener('DOMContentLoaded',()=>{
  VANTA.RINGS({
    el:"#rings-bg",
    backgroundColor:0x0b172a,
    color:0x0b2745,
    waveHeight:3,
    ringGap:26,
    spacing:20,
    speed:0.015,
    mouseControls:false,
    touchControls:false,
    gyroControls:false
  });
});
