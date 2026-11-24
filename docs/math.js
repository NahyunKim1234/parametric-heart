// Mathematical coordinates use y up. Only path() converts to screen space.
(() => {
  'use strict';
  const TAU = 2 * Math.PI;
  const control = (label, min, max, step, value) => ({label, min, max, step, value});
  const families = {
    heart: {
      name: 'Heart / cardioid', formula: 'r = a(1 − b sin t)', polar: true,
      a: control('Size', .5, 3, .1, 1.5), b: control('Indentation', 0, 2, .05, 1),
      unit: 34, coordinate(t, a, b) { return polar(a * (1 - b * Math.sin(t)), t); }
    },
    rose: {
      name: 'Rose', formula: 'r = a cos(bt)', polar: true,
      a: control('Size', .5, 3, .1, 1.5), b: control('Frequency', 1, 10, 1, 5),
      unit: 62, coordinate(t, a, b) { return polar(a * Math.cos(b*t), t); }
    },
    lissajous: {
      name: 'Lissajous', formula: 'x = sin(at + π/4),  y = sin(bt)',
      a: control('Horizontal cycles', 1, 8, 1, 3), b: control('Vertical cycles', 1, 8, 1, 2),
      unit: 89, coordinate(t,a,b) { return [Math.sin(a*t + Math.PI/4), Math.sin(b*t)]; }
    },
    hypotrochoid: {
      name: 'Hypotrochoid', formula: 'x = (a−1) cos t + b cos((a−1)t),  y = (a−1) sin t − b sin((a−1)t)',
      a: control('Outer radius', 2, 8, 1, 5), b: control('Pen offset', 0, 3, .1, 1.8),
      unit: 16, coordinate(t,a,b) {return [(a-1)*Math.cos(t)+b*Math.cos((a-1)*t),(a-1)*Math.sin(t)-b*Math.sin((a-1)*t)];}
    },
    linear: {
      name: 'Linear', formula: 'y = ax + b', a: control('Slope', -2, 2, .1, .8), b: control('Height at zero', -2, 2, .1, 0),
      unit: 30, open: true, coordinate(x,a,b) {return [x,a*x+b];}
    },
    quadratic: {
      name: 'Quadratic', formula: 'y = ax² + b', a: control('Curvature', -2, 2, .1, .5), b: control('Height at zero', -2, 2, .1, -1),
      unit: 30, open: true, coordinate(x,a,b) {return [x,a*x*x+b];}
    }
  };
  function polar(r,t) {return [r*Math.cos(t), r*Math.sin(t)];}
  function defaults(id) {
    const {a,b} = families[id];
    return {a:a.value,b:b.value,scale:1,rotation:0,mirror:false};
  }
  function point(id,t,p) {
    let [x,y] = families[id].coordinate(t,p.a,p.b);
    if (p.mirror) x = -x;
    const angle = p.rotation * Math.PI/180;
    return [p.scale*(x*Math.cos(angle)-y*Math.sin(angle)),p.scale*(x*Math.sin(angle)+y*Math.cos(angle))];
  }
  function path(id,p) {
    const {open,unit} = families[id];
    const n = open ? 200 : 800;
    const d = [];
    for (let i=0;i<=n;i++) {
      const t = open ? -5+10*i/n : TAU*i/n;
      const [x,y] = point(id,t,p);
      d.push((i?'L':'M')+(x*unit).toFixed(2)+' '+(-y*unit).toFixed(2));
    }
    return d.join(' ') + (open?'':' Z');
  }
  globalThis.Curves = {families, defaults, point, path};
})();
