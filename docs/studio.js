// The studio uses the same sampled mathematical paths as the lab.
(() => {
  "use strict";
  const STORAGE = "parametric-heart.studio.v1";
  const LIMIT = 6;
  const SWATCHES = ["#eca8af", "#a9bde9", "#a1c5b8", "#e0c48e", "#c3abdc", "#efeef7"];
  const FIELD = "#0c0f19";
  const copy = value => JSON.parse(JSON.stringify(value));
  let session;

  function layer(id, color, changes = {}) {
    return { id, ...Curves.defaults(id), color, repeats: 1, offset: 0, ...changes };
  }
  function initial() {
    return {
      version: 1, active: 0, angle: 0, background: FIELD,
      layers: [
        layer("heart", SWATCHES[0], { a: 1.5, b: 1, scale: 1, rotation: 15, repeats: 14, offset: 18 }),
        layer("rose", SWATCHES[1], { a: 1.8, b: 5, scale: 0.66, repeats: 3 })
      ]
    };
  }
  const isColor = value => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
  const inRange = (n, min, max) => Number.isFinite(n) && n >= min && n <= max;
  function validated(data) {
    if (!data || data.version !== 1 || !Array.isArray(data.layers) ||
        !inRange(data.layers.length, 1, LIMIT) || !Number.isInteger(data.active) ||
        !inRange(data.active, 0, data.layers.length - 1) || !isColor(data.background) || !inRange(data.angle, 0, 360)) throw Error();
    for (const l of data.layers) {
      if (!Object.hasOwn(Curves.families, l.id) || !isColor(l.color)) throw Error();
      const family = Curves.families[l.id];
      for (const k of ["a", "b"]) {
        const spec = family[k];
        if (!inRange(l[k], spec.min, spec.max) ||
            Math.abs((l[k] - spec.min) / spec.step - Math.round((l[k] - spec.min) / spec.step)) > 1e-6) throw Error();
      }
      if (!inRange(l.scale, 0.2, 2) || !inRange(l.rotation, -180, 180) ||
          !Number.isInteger(l.repeats) || !inRange(l.repeats, 1, 16) ||
          !inRange(l.offset, 0, 60) || typeof l.mirror !== "boolean") throw Error();
    }
    return copy(data);
  }
  function range(key, title, value, min, max, step, suffix = "") {
    return '<label class="phs-range"><span>' + title + '</span><output data-out="' + key + '">' +
      value + suffix + '</output><input type="range" aria-label="' + title + '" data-key="' + key + '" data-suffix="' +
      suffix + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '"></label>';
  }

  window.mountStudio = root => {
    let state = copy(session || initial());
    let history = [], pending = null, frame = 0, last = 0, disposed = false;
    const current = () => state.layers[state.active];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const find = s => root.querySelector(s);
    root.innerHTML = `
      <div class="phs"><div class="phs-editor">
        <section class="phs-stage" aria-label="Design preview">
          <div class="phs-stagehead"><span>COMPOSITION</span><span data-count></span></div>
          <svg class="phs-image" xmlns="http://www.w3.org/2000/svg" viewBox="-150 -150 300 300" role="img" aria-labelledby="phs-title phs-desc">
            <title id="phs-title">Layered mathematical artwork</title><desc id="phs-desc"></desc>
            <rect x="-150" y="-150" width="300" height="300" data-field/>
            <g data-art fill="none" stroke-width=".65" stroke-linejoin="round"></g>
          </svg>
          <div class="phs-stagefoot"><button data-action="play" aria-pressed="false">▷ Play rotation</button><label>Paper <input data-key="background" aria-label="Artwork background color" type="color"></label></div>
        </section>
        <section class="phs-inspector" aria-label="Layer controls">
          <div class="phs-heading"><h3>Layers</h3><button data-action="add">+ Add layer</button></div>
          <div data-stack class="phs-stack" aria-label="Choose layer"></div>
          <div data-controls></div>
          <details><summary>How the pattern works</summary><p>Each line follows a curve from the Visual Lab. Copies turn around the center in equal steps. Move the curve outward with Orbit to open up the center.</p></details>
        </section>
      </div><div class="phs-tools">
        <div><button data-action="undo">Undo</button><button data-action="reset">Reset design</button></div>
        <div><button data-action="save">Save on device</button><button data-action="restore">Restore save</button></div>
        <div><button data-action="svg">Export SVG</button><button data-action="png">Export PNG</button></div>
      </div><p class="phs-status" role="status" aria-live="polite"></p></div>`;
    const message = text => { if (!disposed) find(".phs-status").textContent = text; };
    function draw() {
      const image = find(".phs-image");
      image.style.background = state.background;
      find("[data-field]").setAttribute("fill", state.background);
      find("[data-art]").setAttribute("transform", "rotate(" + state.angle + ")");
      find("[data-art]").innerHTML = state.layers.map(l => {
        const path = Curves.path(l.id, l);
        const lines = Array.from({length:l.repeats}, (_, i) =>
          '<use href="#phs-path-' + state.layers.indexOf(l) + '" transform="rotate(' +
          i * 360 / l.repeats + ') translate(' + l.offset + ' 0)"/>').join("");
        return '<g stroke="' + l.color + '"><defs><path id="phs-path-' + state.layers.indexOf(l) +
          '" d="' + path + '"/></defs>' + lines + '</g>';
      }).join("");
      find("#phs-desc").textContent = state.layers.map((l, i) =>
        'Layer ' + (i + 1) + ', ' + Curves.families[l.id].name + ', ' + l.repeats +
        ' copies, scale ' + l.scale + ', rotation ' + l.rotation + ' degrees.').join(" ");
      find("[data-count]").textContent = state.layers.length + (state.layers.length === 1 ? " LAYER" : " LAYERS");
      find('[data-key="background"]').value = state.background;
      session = copy(state);
    }
    function render() {
      const l = current(), f = Curves.families[l.id];
      find("[data-stack]").innerHTML = state.layers.map((item, i) =>
        '<button data-layer="' + i + '" aria-pressed="' + (i === state.active) + '"><i style="background:' +
        item.color + '"></i>' + (i + 1) + ' · ' + Curves.families[item.id].name + '</button>').join("");
      find("[data-controls]").innerHTML = `<div class="phs-shape"><label>Curve family<select data-key="id">` +
        Object.entries(Curves.families).map(([id, spec]) => '<option value="' + id + '"' +
        (l.id === id ? " selected" : "") + '>' + spec.name + '</option>').join("") +
        '</select></label><label>Ink<input data-key="color" type="color" value="' + l.color + '"></label></div>' +
        range("a", f.a.label, l.a, f.a.min, f.a.max, f.a.step) +
        range("b", f.b.label, l.b, f.b.min, f.b.max, f.b.step) +
        range("repeats","Copies",l.repeats,1,16,1) +
        '<details class="phs-transform"><summary>Transform layer</summary>' +
        range("scale","Scale",l.scale,0.2,2,0.01,"×") +
        range("rotation","Rotation",l.rotation,-180,180,1,"°") +
        range("offset","Orbit",l.offset,0,60,1) +
        '<label><input data-key="mirror" type="checkbox"' + (l.mirror ? " checked" : "") +
        '> Reflect across vertical axis</label></details>' +
        '<button class="phs-delete" data-action="remove"' + (state.layers.length === 1 ? " disabled" : "") + '>Remove selected layer</button>';
      find('[data-action="undo"]').disabled = !history.length;
      find('[data-action="add"]').disabled = state.layers.length === LIMIT;
      draw();
    }
    function remember(snapshot = state) {
      history.push(copy(snapshot));
      if (history.length > 40) history.shift();
      find('[data-action="undo"]').disabled = false;
    }
    function input(e) {
      const el = e.target, key = el.dataset.key;
      if (!key || ["id","mirror"].includes(key)) return;
      if (!pending) pending = copy(state);
      if (key === "background") state.background = el.value;
      else if (key === "color") {
        current().color = el.value;
        find('[data-layer="' + state.active + '"] i').style.background = el.value;
      } else {
        current()[key] = el.valueAsNumber;
        find('[data-out="' + key + '"]').textContent = el.value + el.dataset.suffix;
      }
      draw();
    }
    function change(e) {
      const el = e.target;
      if (el.dataset.key === "id") {
        remember();
        const l = current(), d = Curves.defaults(el.value);
        Object.assign(l, {id:el.value, a:d.a, b:d.b});
        render();
        find('[data-key="id"]').focus();
      } else if (el.dataset.key === "mirror") {
        remember(); current().mirror = el.checked; draw();
      } else if (pending) {
        remember(pending); pending = null;
      }
    }
    function saveFile(blob, ext) {
      const url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = "parametric-heart." + ext;
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      message(ext.toUpperCase() + " download prepared.");
    }
    function output(ext) {
      const image = find(".phs-image").cloneNode(true);
      image.removeAttribute("style"); image.removeAttribute("class");
      image.setAttribute("width","1600"); image.setAttribute("height","1600");
      const blob = new Blob([new XMLSerializer().serializeToString(image)], {type:"image/svg+xml;charset=utf-8"});
      if (ext === "svg") return saveFile(blob,"svg");
      const url = URL.createObjectURL(blob), img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1600;
          canvas.getContext("2d").drawImage(img,0,0,1600,1600);
          canvas.toBlob(b => { if (!disposed && b) saveFile(b,"png"); else message("PNG export failed. Try SVG."); }, "image/png");
        } catch { message("PNG export failed. Try SVG."); }
        finally { URL.revokeObjectURL(url); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); message("PNG export failed. Try SVG."); };
      img.src = url;
    }
    function stop() {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      const b = find('[data-action="play"]');
      b.textContent = "▷ Play rotation"; b.setAttribute("aria-pressed","false");
    }
    function step(t) {
      if (last) state.angle = (state.angle + Math.min(100,t-last) * .012) % 360;
      last = t; find("[data-art]").setAttribute("transform","rotate(" + state.angle + ")");
      frame = requestAnimationFrame(step);
    }
    function click(e) {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.dataset.layer !== undefined) {
        state.active = Number(btn.dataset.layer); render(); find('[data-layer="' + state.active + '"]').focus(); return;
      }
      switch (btn.dataset.action) {
        case "add":
          remember(); state.layers.push(layer("rose",SWATCHES[state.layers.length % SWATCHES.length]));
          state.active = state.layers.length - 1; render(); find('[data-key="id"]').focus(); message("New layer selected."); break;
        case "remove":
          if (state.layers.length < 2) return;
          remember(); state.layers.splice(state.active,1); state.active = Math.min(state.active,state.layers.length-1);
          render(); find('[data-layer="' + state.active + '"]').focus(); message("Layer removed."); break;
        case "undo":
          if (history.length) { state = history.pop(); render(); message("Previous edit restored."); } break;
        case "reset":
          remember(); stop(); state = initial(); render(); message("Opening design restored."); break;
        case "save":
          try { localStorage.setItem(STORAGE, JSON.stringify(state)); message("Design saved in this browser."); }
          catch { message("Device storage unavailable. Export the artwork to keep an image."); } break;
        case "restore":
          try {
            const raw = localStorage.getItem(STORAGE);
            if (!raw) return message("No saved design yet. Choose Save on device first.");
            const saved = validated(JSON.parse(raw)); remember(); stop(); state = saved; render(); message("Saved design restored.");
          } catch { message("Saved design unavailable or unreadable. Your current design is intact."); } break;
        case "play":
          if (frame) stop();
          else { btn.textContent = "Ⅱ Pause rotation"; btn.setAttribute("aria-pressed","true"); frame = requestAnimationFrame(step); }
          break;
        case "svg": case "png": output(btn.dataset.action); break;
      }
    }
    function importLabCurve() {
      const pendingCurve = window.pendingLabCurve;
      if (!pendingCurve) return;
      delete window.pendingLabCurve;
      const next = copy(state);
      const {id, params} = pendingCurve;
      if (!Object.hasOwn(Curves.families, id) || !params) return;
      const {a, b, rotation, scale, mirror} = params;
      const replace = next.layers.length === LIMIT;
      if (!replace) next.active = next.layers.length;
      const color = replace ? current().color : SWATCHES[next.active % SWATCHES.length];
      next.layers[next.active] = layer(id, color, {a,b,rotation,scale,mirror});
      try {
        const checked = validated(next);
        remember(); state = checked; render();
        message(replace ? "Lab curve replaced the selected layer. Undo restores it." : "Lab curve added as a new layer.");
      } catch { message("This curve contains a setting outside the studio range."); }
    }
    const enter = e => { if (e.detail === "studio") importLabCurve(); };
    window.addEventListener("workspaceenter",enter);
    const motion = () => { if (reduced.matches) stop(); };
    const leave = e => { if (e.detail === "studio") stop(); };
    const hide = () => { if (document.hidden) stop(); };
    window.addEventListener("workspaceleave",leave);
    document.addEventListener("visibilitychange",hide);
    root.addEventListener("input",input); root.addEventListener("change",change); root.addEventListener("click",click);
    reduced.addEventListener("change",motion);
    render(); importLabCurve();
    return () => {
      session = copy(state); disposed = true; cancelAnimationFrame(frame); reduced.removeEventListener("change",motion);
      window.removeEventListener("workspaceenter",enter); window.removeEventListener("workspaceleave",leave); document.removeEventListener("visibilitychange",hide);
      root.removeEventListener("input",input); root.removeEventListener("change",change); root.removeEventListener("click",click);
    };
  };
})();
