// Draw the welcome artwork once at sprite resolution. CSS rotates this flat
// sprite inside a tilted plane, keeping the character and lettering upright.
(() => {
  const canvas = document.getElementById('galaxy');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let seed = 10371;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const palette = ['#20203f', '#292c57', '#313968', '#445582', '#655d8f', '#82799f', '#81a4b7'];
  const center = canvas.width / 2;
  const arms = 4;
  // Short broken filaments make the spiral readable at low contrast.
  for (let i = 0; i < 8200; i++) {
    const u = random();
    const radius = 56 + 132 * u;
    const angle = (i % arms) * Math.PI * 2 / arms + 3.65 * Math.log(radius / 50)
      + (random() + random() - 1) * (.19 + .48 * u);
    const length = 1 + Math.floor(random() * 6);
    const brightness = random() * Math.pow(Math.sin(Math.PI * u), .7);
    ctx.fillStyle = palette[Math.min(6, Math.floor(brightness * 7))];
    ctx.globalAlpha = .35 + .6 * Math.sin(Math.PI * u);
    for (let k = 0; k < length; k++) {
      const t = angle + k / radius;
      ctx.fillRect(Math.round(center + radius * Math.cos(t)), Math.round(center + radius * Math.sin(t)), 1, 1);
    }
  }
})();
