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
  margin: 5px 0 0 5px;
  padding: 0 6px;
  background: #1010f0;
  border-radius: 19px;
  cursor: pointer;
  opacity: 0.9;
}

#gl-bench svg {
  height: 60px;
  fill: #aff;
}

#gl-bench rect {
  fill: #4368e5;
}

#gl-bench text {
  font-family: Helvetica,Arial,sans-serif;
  font-weight: 700;
  dominant-baseline: middle;
  text-anchor: middle;
  fill: #aff;
}

#gl-bench line {
  stroke-width: 5;
  stroke: #aff;
  stroke-linecap: round;
}

#gl-bench polyline {
  fill: none;
  stroke: #aff;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.5;
}`;

let SVG = `
<div class="gl-box">
  <svg viewBox="0 0 14 60" class="gl-cpu-svg">
    <line x1="7" y1="38" x2="7" y2="11" opacity="0.4"></line>
    <line x1="7" y1="38" x2="7" y2="11" opacity="0.7" stroke-dasharray="0 27" class="gl-cpu" style="stroke-dasharray: 0, 100;"></line>
    <path transform="translate(1,43) scale(.29)" d="m15 0c-1.6 3e-16 -2.8 1.3-2.8 2.8v4c-2.7 0.68-4.9 2.8-5.5 5.6h-4c-1.5 0-2.8 1.2-2.8 2.8s1.2 2.8 2.8 2.8h3.8v5.7h-3.7c-1.6 0-2.8 1.3-2.8 2.8 3e-16 1.6 1.3 2.8 2.8 2.8h3.9c0.67 2.7 2.8 4.8 5.5 5.5v3.9c0 1.6 1.3 2.8 2.8 2.8 1.6 0 2.8-1.3 2.8-2.8v-3.7h5.7v3.7c0 1.6 1.3 2.8 2.8 2.8 1.6 0 2.8-1.3 2.8-2.8v-3.9c2.7-0.67 4.8-2.8 5.5-5.5h3.9c1.6 0 2.8-1.3 2.8-2.8 0-1.6-1.3-2.8-2.8-2.8h-3.7v-5.7h3.8c1.5 0 2.8-1.2 2.8-2.8s-1.2-2.8-2.8-2.8h-4c-0.65-2.7-2.8-4.9-5.5-5.6v-3.9c0-1.6-1.3-2.8-2.8-2.8-1.6 3e-16 -2.8 1.3-2.8 2.8v3.7h-5.7v-3.7c0-1.6-1.3-2.8-2.8-2.8zm2 12h7.2c2.6 0 4.7 2.1 4.7 4.7v7.2c0 2.6-2.1 4.7-4.7 4.7h-7.2c-2.6 0-4.7-2.1-4.7-4.7v-7.2c0-2.6 2.1-4.7 4.7-4.7z"></path>
  </svg>
  <svg viewBox="0 0 55 60">
    <text x="27" y="56" font-size="0.75em" class="gl-fps">00 FPS</text>
    <text x="28" y="8" font-size="0.55rem" class="gl-mem">mem: 76mb</text>
    <rect x="0" y="14" rx="4" ry="4" width="55" height="32"></rect>
    <polyline class="gl-chart" points="0 0 0 0"></polyline>
  </svg>
  <svg viewBox="0 0 14 60" class="gl-gpu-svg">
    <line x1="7" y1="38" x2="7" y2="11" opacity="0.4"></line>
    <line x1="7" y1="38" x2="7" y2="11" stroke-dasharray="0 27" class="gl-gpu" style="stroke-dasharray: 14, 100;"></line>
    <path transform="translate(0.93,43) scale(1.15)" d="m0.885 0.328a0.64 0.64 0 1 0-0.00362 1.28c0.509 0.00201 0.491 0.112 0.552 0.278 0.061 0.165 0.0429 0.379 0.0429 0.379l-0.00568 0.047v7.54a0.64 0.64 0 1 0 1.28 0v-1.23c0.22 0.0828 0.459 0.13 0.711 0.13h4.58c1.09 0 1.96-0.848 1.96-1.9v-2.7c0-1.05-0.875-1.9-1.96-1.9h-4.58c-0.251 0-0.49 0.047-0.71 0.13 0.0157-0.143 0.0366-0.52-0.118-0.938-0.195-0.528-0.826-1.11-1.75-1.11zm2.53 3.17c0.369 0 0.666 0.315 0.666 0.706v2.59c0 0.391-0.297 0.706-0.666 0.706s-0.666-0.315-0.666-0.706v-2.59c0-0.391 0.297-0.706 0.666-0.706zm3.58 0a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2z"></path>
  </svg>
</div>`;