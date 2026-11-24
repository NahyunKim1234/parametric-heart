/* Currency inputs use whole cents. Display rounding happens only at defined boundaries. */
(function (scope) {
  "use strict";
  function quantity(value, name, min, max, integer = false) {
    if (value === "" || value == null || !Number.isFinite(Number(value)))
      throw Error("Enter a number for " + name + ".");
    const n = Number(value);
    if (n < min || n > max || (integer && !Number.isInteger(n)))
      throw Error("Use " + (integer ? "a whole number" : "a number") + " from " + min + " to " + max + " for " + name + ".");
    return n;
  }
  function cents(value, name) {
    const n = quantity(value, name, 0, 1000000);
    if (Math.abs(n * 100 - Math.round(n * 100)) > 0.000001) throw Error("Use at most two decimal places for " + name + ".");
    return Math.round(n * 100);
  }
  function percent(v, name) { return quantity(v, name, 0, 100, true); }
  function discount(price, off) {
    const total = cents(price, "price");
    const paid = Math.round(total * (100 - percent(off, "discount")) / 100);
    return { paid: paid / 100, saved: (total - paid) / 100 };
  }
  function ratio(a, b, total) {
    a = quantity(a,"water parts",1,30,true); b = quantity(b,"syrup parts",1,30,true);
    total = quantity(total,"batch volume",1,10000);
    return [total * a / (a+b), total * b / (a+b)];
  }
  function fraction(a,b) {
    a = quantity(a,"selected pieces",0,24,true); b = quantity(b,"pieces per whole",1,12,true);
    return { quotient:a/b, full:Math.floor(a/b), rest:a%b };
  }
  function unit(price,grams) {
    return cents(price,"pack price") / quantity(grams,"pack weight",1,100000);
  }
  function budget(total, fixed, savings) {
    const t = cents(total,"income");
    fixed = percent(fixed,"essentials"); savings = percent(savings,"savings");
    if(fixed+savings>100) throw Error("Essentials and savings exceed 100%. Lower one share to leave room for spending.");
    // Round cumulative boundaries, keeping every cent allocated even for tiny totals.
    const f = Math.round(t*fixed/100), allocated = Math.round(t*(fixed+savings)/100);
    return [f/100,(allocated-f)/100,(t-allocated)/100];
  }
  function rate(start,end,hours) {
    return (quantity(end,"ending temperature",-100,150)-quantity(start,"starting temperature",-100,150))/quantity(hours,"elapsed hours",0.01,1000);
  }
  function simulate(chance, trials, random=Math.random) {
    chance = percent(chance,"chance"); trials = quantity(trials,"trials",1,10000,true);
    let hits=0; for(let i=0;i<trials;i++) if(random()<chance/100) hits++;
    return { hits, misses:trials-hits, expected:trials*chance/100 };
  }
  const api={discount,ratio,fraction,unit,budget,rate,simulate,percent,quantity};
  scope.PracticalMath=api;
  if(typeof module!=="undefined" && module.exports) module.exports=api;
})(globalThis);
