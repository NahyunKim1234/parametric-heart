(() => {
  'use strict';
  const {families,defaults,path,point} = Curves;
  const presets = {
    heart:[['Circle',0],['Cardioid',1],['Inner loop',1.5]],
    rose:[['Three petals',3],['Eight petals',4],['Five petals',5]],
    lissajous:[['Diagonal ellipse',1,1],['3 by 2',2,3],['5 by 4',4,5]],
    hypotrochoid:[['Circle',0],['Cusps',1],['Loops',2]],
    linear:[['Flat',0,0],['Rising',0,1],['Falling',0,-1]],
    quadratic:[['Bowl',0,.5],['Arch',0,-.5],['Lifted',1,.5]]
  };
  const descriptions = {
    heart: p=>p.b===0?'The radius stays constant through a full turn. The outline is a circle.':p.b===1?'The radius reaches zero once each turn. The two sides meet in a cusp at the origin.':p.b>1?'Part of the radius becomes negative. The point crosses the origin and draws an inner loop.':'The radius changes as the angle turns. Increase indentation to bring the curve closer to the origin.',
    rose:p=>'The curve traces '+(p.b%2?p.b:p.b*2)+' '+(p.b===1?'petal':'petals')+'. Odd frequencies give one petal per cycle. Even frequencies give two.',
    lissajous:p=>'During one full turn, the point oscillates '+p.a+' times horizontally and '+p.b+' times vertically. Their timing shapes the crossings.',
    hypotrochoid:p=>'A circle of radius 1 rolls inside a ring of radius '+p.a+'. A pen '+p.b+' units from its center traces the outline.',
    linear:p=>'Before transformations, each step right changes the height by '+p.a+'. The line crosses the vertical axis at '+p.b+'.',
    quadratic:p=>'Before transformations, the height at zero is '+p.b+'. '+(p.a===0?'With zero curvature the graph is flat.':p.a>0?'The arms open upward.':'The arms open downward.')
  };
  const aliases = {
    heart: 'Heart Nebula', rose: 'Stellar Bloom', lissajous: 'Orbital Resonance',
    hypotrochoid: 'Rolling Orbit', linear: 'Light Ray', quadratic: 'Radio Dish'
  };
  const tips = {
    heart: 'Set indentation to 1 to meet the cusp of a cardioid.',
    rose: 'Move frequency from 3 to 4. Watch three petals become eight.',
    lissajous: 'Try matching the two frequencies, then change just one.',
    hypotrochoid: 'The pen sits on the rolling circle when its offset is 1.',
    linear: 'Try a slope of zero to make the line level.',
    quadratic: 'Move curvature through zero to turn the bowl upside down.'
  };
  const glyphs = Object.fromEntries(Object.keys(families).map(id => {
    const box = id==='heart' ? '-92 -24 184 140' : '-115 -115 230 230';
    return [id,`<svg aria-hidden="true" viewBox="${box}"><path d="${path(id,defaults(id))}"/></svg>`];
  }));
  // Use the longer visible axis so even a horizontal or vertical line carries the full ramp.
  function gradientEnds(id, p, fit, shift) {
    const f = families[id];
    let xmin=Infinity, xmax=-Infinity, ymin=Infinity, ymax=-Infinity;
    for(let i=0;i<=200;i++) {
      const t = f.open ? -5+i/20 : Math.PI*i/100;
      const [x,y] = point(id,t,p);
      const px=x*f.unit, py=-y*f.unit;
      if(Math.abs(px/fit)>212 || Math.abs(py/fit+shift)>141) continue;
      xmin=Math.min(xmin,px); xmax=Math.max(xmax,px);
      ymin=Math.min(ymin,py); ymax=Math.max(ymax,py);
    }
    if(!Number.isFinite(xmin)) return [-120,0,120,0];
    return xmax-xmin>=ymax-ymin ? [xmin,0,Math.max(xmax,xmin+1),0] : [0,ymin,0,Math.max(ymax,ymin+1)];
  }
  const rotation = {label:'Rotation (°)',min:-180,max:180,step:5};
  const scale = {label:'Scale',min:.5,max:2,step:.05};
  let state = {id:'heart',p:defaults('heart'),reference:null,guides:true};
  function field(key,s,p) {
    return '<label class="lab-field" for="lab-'+key+'"><span>'+s.label+'</span><output for="lab-'+key+'">'+p[key]+'</output><input aria-label="'+s.label+'" id="lab-'+key+'" type="range" data-key="'+key+'" min="'+s.min+'" max="'+s.max+'" step="'+s.step+'" value="'+p[key]+'"></label>';
  }
  window.mountLab = function(root) {
    function build() {
      const {id,p,reference,guides}=state, f=families[id];
      const choices = Object.entries(families).map(([k,v]) =>
        `<option value="${k}" ${k===id?'selected':''}>${v.name}${['heart','rose'].includes(k)?'':' · '+aliases[k]}</option>`).join('');
      const buttons = presets[id].map(([name],i) =>
        `<button data-preset="${i}">${name}</button>`).join('');
      const familyButtons = Object.entries(families).map(([key,item]) =>
        `<button type="button" data-family="${key}" aria-pressed="${id===key}">${glyphs[key]}<span>${item.name}</span></button>`).join('');
      root.innerHTML = `
        <div class="lab-work">
          <aside class="lab-rail">
            <section class="lab-choose" aria-label="Curve family">
              <h3>Curve family</h3><div class="lab-families">${familyButtons}</div>
              <select aria-label="Curve family" id="lab-family">${choices}</select>
            </section>
            <section class="lab-presets" aria-label="Presets"><h3>Presets</h3><div>${buttons}</div></section>
            <section class="lab-reading"><h3>What you’re seeing</h3><p id="lab-explanation"></p>
              <details><summary>Equation &amp; steps</summary><p class="lab-equation">${f.formula}${f.polar?' · x = r cos t, y = r sin t':''}</p>
              <ol><li>Choose a preset.</li><li>Pin the curve and move one slider. The dashed line keeps your starting shape.</li><li>Try a rotation or reflection.</li></ol></details></section>
          </aside>
          <section class="lab-console" aria-label="Curve workspace">
            <div class="lab-plate"><div class="lab-plate-top"><div class="lab-study-name"><h2>${aliases[id]}</h2><span>${f.name}</span></div>
                <label><input type="checkbox" id="lab-guides" ${guides?'checked':''}> Orbit guides</label></div>
              <svg id="lab-graph" role="img" aria-labelledby="lab-title lab-desc" viewBox="-212 -141 424 282">
                <title id="lab-title"></title><desc id="lab-desc"></desc>
                <defs><linearGradient id="lab-spectrum" gradientUnits="userSpaceOnUse"><stop class="lab-stop-first"/><stop offset=".5" class="lab-stop-middle"/><stop offset="1" class="lab-stop-last"/></linearGradient></defs>
                ${f.open ? '<defs><pattern id="lab-cartesian-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#9ba5c9" stroke-opacity=".18" stroke-width=".5"/></pattern></defs><rect x="-212" y="-141" width="424" height="282" fill="url(#lab-cartesian-grid)"/>' : ''}
                <g class="lab-orbits" aria-hidden="true"><ellipse rx="182" ry="48" transform="rotate(-14)"/><ellipse rx="152" ry="81" transform="rotate(18)"/><circle r="111"/></g>
                <g id="lab-traces"></g>
              </svg>
              <div class="lab-caption"><span class="lab-swatch"></span> Current curve <span id="lab-reflegend"></span></div>
            </div>
            <div class="lab-sliders">${field('a',f.a,p)}${field('b',f.b,p)}</div>
            <div class="lab-footer"><details class="lab-transform"><summary>Transformations</summary>${field('scale',scale,p)}${field('rotation',rotation,p)}
                <label><input type="checkbox" id="lab-mirror" ${p.mirror?'checked':''}> Reflect across vertical axis</label></details>
              <div class="lab-actions"><button id="lab-compare">${reference?'Clear reference':'Pin to compare'}</button><button id="lab-reset">Reset curve</button><button id="lab-studio">Use in Studio ↗</button></div>
            </div>
          </section>
        </div>`;
      draw();
    }
    function draw() {
      const {id,p,reference,guides}=state, f=families[id];
      const versions=reference?[reference,p]:[p];
      let fit=id==='heart'?.70:1, shift=id==='heart'?-48:0;
      if(!f.open) for (const v of versions) for(let i=0;i<=300;i++) {
        const [x,y]=point(id,2*Math.PI*i/300,v);
        fit=Math.max(fit, Math.abs(x*f.unit)/196, (-y*f.unit)/(132-shift), y*f.unit/(132+shift));
      }
      const d=path(id,p);
      const ends=gradientEnds(id,p,fit,shift);
      const gradient=root.querySelector('#lab-spectrum');
      ['x1','y1','x2','y2'].forEach((key,i)=>gradient.setAttribute(key,ends[i]));
      let traces='<g transform="translate(0 '+shift+')"><path class="lab-axis" d="M-212 0H212 M0 -200V200"/><g transform="scale('+1/fit+')"><defs><path id="lab-current" d="'+d+'"/></defs>';
      if(guides && !f.open) for(let k=1;k<9;k++) traces+='<use href="#lab-current" class="lab-guide" transform="scale('+(.12+.88*k/9)+')" />';
      traces+='<use href="#lab-current" class="lab-current"/>';
      if(reference)traces+='<path class="lab-reference" d="'+path(id,reference)+'"/>';
      traces+='</g><circle r="1.8" class="lab-origin"/></g>';
      if (f.open) {
        const ticks=[];
        for(let k=-4;k<=4;k++) {
          if(k===0) continue;
          ticks.push('<path d="M'+(k*f.unit)+' -2v4 M-2 '+(-k*f.unit)+'h4"/><text x="'+(k*f.unit)+'" y="10">'+k+'</text><text x="-8" y="'+(-k*f.unit+2)+'">'+k+'</text>');
        }
        traces+='<g class="lab-ticks">'+ticks.join('')+'<text x="200" y="-5">x</text><text x="6" y="-130">y</text></g>';
      }
      root.querySelector('#lab-traces').innerHTML=traces;
      root.querySelector('#lab-reflegend').textContent=reference?'┄ Pinned reference':'';
      root.querySelector('#lab-explanation').textContent=descriptions[id](p);
      root.querySelector('#lab-title').textContent=f.name+' curve';
      root.querySelector('#lab-desc').textContent=descriptions[id](p)+' Scale '+p.scale+', rotation '+p.rotation+' degrees.'+(guides&&!f.open?' Thin interior lines are scaled copies of the outline.':'');
      root.querySelector('.lab-orbits').style.display=guides && !f.open ? '' : 'none';
      root.querySelector('#lab-guides').closest('label').hidden=!!f.open;
      for(const input of root.querySelectorAll('[data-key]')) {
        const value=p[input.dataset.key]; input.value=value; input.previousElementSibling.value=value;
      }
      root.querySelector('#lab-mirror').checked=p.mirror;
    }
    root.oninput=e=>{
      const k=e.target.dataset.key;
      if(k) {state.p[k]=Number(e.target.value);draw();}
    };
    function switchFamily(id,selector) {
      state.id=id;state.p=defaults(id);state.reference=null;
      build();
      root.querySelector(selector).focus();
      window.dispatchEvent(new CustomEvent('curveinsight',{detail:tips[id]}));
    }
    root.onchange=e=>{
      switch(e.target.id) {
        case 'lab-family':switchFamily(e.target.value,'#lab-family');break;
        case 'lab-mirror':state.p.mirror=e.target.checked;draw();break;
        case 'lab-guides':state.guides=e.target.checked;draw();break;
      }
    };
    root.onclick=e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.hasAttribute('data-family')) {switchFamily(b.dataset.family,'[data-family="'+b.dataset.family+'"]');}
      else if(b.hasAttribute('data-preset')) {
        const [,v,a]=presets[state.id][Number(b.dataset.preset)];
        state.p={...defaults(state.id),b:v};if(a!==undefined)state.p.a=a;draw();
      } else if(b.id==='lab-reset') {state.p=defaults(state.id);draw();}
      else if(b.id==='lab-studio'){window.pendingLabCurve={id:state.id,params:{...state.p}};location.hash='studio';}
      else if(b.id==='lab-compare'){state.reference=state.reference?null:{...state.p};b.textContent=state.reference?'Clear reference':'Pin to compare';draw();}
    };
    build();
    return ()=>{root.onchange=null;root.oninput=null;root.onclick=null;};
  };
})();
