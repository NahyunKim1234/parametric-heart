// Keep each workspace alive when switching tabs so experiments survive navigation.
const pages = {
  lab: ['Visual Lab', 'Move one slider. See what changes in the curve.', window.mountLab],
  everyday: ['Everyday Math', 'Explore a purchase, split a budget, or test the odds.', window.mountEveryday],
  studio: ['Design Studio', 'Build a composition from layers of mathematical curves.', window.mountStudio]
};
const workspace = document.getElementById('work');
let active = null;
function showPage() {
  let key = location.hash.slice(1);
  if (key === 'work') return;
  if (!Object.hasOwn(pages, key)) key = 'lab';
  const [title, intro, mount] = pages[key];
  document.title = title + ' · Parametric Heart';
  document.getElementById('title').textContent = title;
  document.getElementById('guide-tip').textContent = intro;
  document.querySelectorAll('nav a').forEach(link => {
    if (link.hash === '#' + key) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (active && active !== key) {
    workspace.querySelector('[data-module="'+active+'"]').hidden = true;
    window.dispatchEvent(new CustomEvent('workspaceleave', {detail: active}));
  }
  let pane = workspace.querySelector('[data-module="'+key+'"]');
  if (!pane) {
    pane = document.createElement('section');
    pane.dataset.module = key;
    pane.setAttribute('aria-label', title);
    workspace.append(pane);
    mount(pane);
  }
  pane.hidden = false;
  active = key;
  window.dispatchEvent(new CustomEvent("workspaceenter",{detail:key}));
}
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault(); workspace.focus();
});
window.addEventListener('hashchange',showPage);
showPage();

const welcome = document.getElementById('welcome');
const enter = document.getElementById('enter');
let visited = false;
try { visited = sessionStorage.getItem('cosmos-intro') === 'seen'; } catch {}
if (!visited && typeof welcome.showModal === 'function' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  welcome.showModal();
  try { sessionStorage.setItem('cosmos-intro','seen'); } catch {}
  const closeIntro = () => { if (welcome.open) welcome.close(); };
  const timer = setTimeout(closeIntro, 1750);
  enter.onclick = closeIntro;
  welcome.addEventListener('close', () => clearTimeout(timer), {once:true});
}
const pose = document.getElementById('guide-pose');
const tip = document.getElementById('guide-tip');
let tipTimer;
function clearTip() {
  clearTimeout(tipTimer);
  pose.classList.remove('pointing');
  tip.textContent = pages[active || 'lab'][1];
}
window.addEventListener('workspaceenter', clearTip);
window.addEventListener('curveinsight', event => {
  clearTip();
  pose.classList.add('pointing');
  tip.textContent = event.detail;
  tipTimer = setTimeout(clearTip,6500);
});
