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
}

#gl-bench rect {
  fill: #1e5e6c;
}

#gl-bench .opacity {
  stroke: #888;
}
`;
