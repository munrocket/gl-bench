let CSS = `
#gl-bench {
  position:absolute;
  left:0;
  top:0;
  z-index:1000;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

#gl-bench div {
  position: relative;
  display: block;
  margin: 5px;
  padding: 0 7px 0 10px;
  background: #bdbdbd;
  border-radius: 15px;
  cursor: pointer;
  opacity: 0.9;
}

#gl-bench svg {
  height: 60px;
  margin: 0 -1px;
}

#gl-bench rect {
  fill: #1e5e6c;
}

#gl-bench text {
  font-family: Helvetica,Arial,sans-serif;
  font-weight: 700;
  dominant-baseline: middle;
  text-anchor: middle;
}

#gl-bench line {
  stroke-width: 5;
  stroke: #222;
  stroke-linecap: round;
}

#gl-bench polyline {
  fill: none;
  stroke: #8db;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}`;

let SVG = `
<div class="gl-box">
  <svg viewBox="0 0 55 60">
    <text x="27" y="56" font-size="0.75em" class="gl-fps">00 FPS</text>
    <text x="28" y="8" font-size="0.55rem" class="gl-mem"></text>
    <rect x="0" y="14" rx="4" ry="4" width="55" height="32"></rect>
    <polyline class="gl-chart" points="0.0,31.6 2.9,28.0 5.8,34.0 8.7,28.0 11.6,30.0 14.5,30.0 17.4,30.0 20.3,28.0 23.2,30.0 26.1,31.6 28.9,30.0 31.8,30.0 34.7,28.0 37.6,31.6 40.5,28.0 43.4,34.0 46.3,28.0 49.2,34.0 52.1,31.6 55.0,28.0"></polyline>
  </svg>
  <svg viewBox="0 0 14 60">
    <line x1="7" y1="38" x2="7" y2="11" opacity="0.4"></line>
    <line x1="7" y1="38" x2="7" y2="11" opacity="0.7" stroke-dasharray="0 27" class="gl-cpu" style="stroke-dasharray: 0, 100;"></line>
    <path transform="translate(1,43) scale(.29)" d="m15 0c-1.6 3e-16 -2.8 1.3-2.8 2.8v4c-2.7 0.68-4.9 2.8-5.5 5.6h-4c-1.5 0-2.8 1.2-2.8 2.8s1.2 2.8 2.8 2.8h3.8v5.7h-3.7c-1.6 0-2.8 1.3-2.8 2.8 3e-16 1.6 1.3 2.8 2.8 2.8h3.9c0.67 2.7 2.8 4.8 5.5 5.5v3.9c0 1.6 1.3 2.8 2.8 2.8 1.6 0 2.8-1.3 2.8-2.8v-3.7h5.7v3.7c0 1.6 1.3 2.8 2.8 2.8 1.6 0 2.8-1.3 2.8-2.8v-3.9c2.7-0.67 4.8-2.8 5.5-5.5h3.9c1.6 0 2.8-1.3 2.8-2.8 0-1.6-1.3-2.8-2.8-2.8h-3.7v-5.7h3.8c1.5 0 2.8-1.2 2.8-2.8s-1.2-2.8-2.8-2.8h-4c-0.65-2.7-2.8-4.9-5.5-5.6v-3.9c0-1.6-1.3-2.8-2.8-2.8-1.6 3e-16 -2.8 1.3-2.8 2.8v3.7h-5.7v-3.7c0-1.6-1.3-2.8-2.8-2.8zm2 12h7.2c2.6 0 4.7 2.1 4.7 4.7v7.2c0 2.6-2.1 4.7-4.7 4.7h-7.2c-2.6 0-4.7-2.1-4.7-4.7v-7.2c0-2.6 2.1-4.7 4.7-4.7z"></path>
  </svg>
  <svg viewBox="0 0 14 60" class="gl-gpu-svg">
    <line x1="7" y1="38" x2="7" y2="11" opacity="0.4"></line>
    <line x1="7" y1="38" x2="7" y2="11" stroke-dasharray="0 27" class="gl-gpu" style="stroke-dasharray: 14, 100;"></line>
    <path transform="translate(0.93,43) scale(1.15)" d="m0.88 0.33c-0.85-0.0024-0.86 1.3-0.0036 1.3 0.48 0.015 0.57 0.48 0.59 0.89v7.4c0 0.85 1.3 0.85 1.3 0v-1.1c1.8-0.018 3.5-0.0083 5.3-0.0083 1.1-1.6e-5 2-0.85 2-1.9v-2.7c0-1-0.88-1.9-2-1.9-1.8 8.2e-6 -3.5 5.7e-5 -5.3 5e-5 0 0-0.013-0.42-0.17-0.84-0.2-0.53-0.78-1.1-1.7-1.1zm2.5 3.2c0.37 0 0.67 0.32 0.67 0.71v2.6c0 0.39-0.3 0.71-0.67 0.71s-0.67-0.32-0.67-0.71v-2.6c0-0.39 0.3-0.71 0.67-0.71zm3.6 0c1.1 0 2 0.9 2 2s-0.9 2-2 2-2-0.9-2-2 0.9-2 2-2z"/>
  </svg>
</div>`;