(function () {
  "use strict";
  const M = globalThis.PracticalMath;
  const money = n => n.toLocaleString("en-US",{style:"currency",currency:"USD"});
  const fmt = n => Number(n).toLocaleString("en-US",{maximumFractionDigits:2});
  const field = (name, value, min, max, step=1) => ({name,value,min,max,step});
  const dollars = (name, value) => field(name,value,0,1000000,.01);
  const bar = (label, value, total, text, pattern=0) => {
    const width = Number(total) > 0 ? Math.max(0,Math.min(100,value/total*100)) : 0;
    return '<div class="ed-row"><span>'+label+'</span><strong>'+text+'</strong><div class="ed-track"><i class="ed-fill ed-fill-'+pattern+'" style="width:'+width+'%"></i></div></div>';
  };
  const tools = {
    discount:{
      name:"Discount", title:"What will I actually pay?", context:"Try a sale price before you buy.",
      fields:[dollars("Original price ($)",80),field("Discount (%)",25,0,100)],
      run([price,off]){
        const {paid,saved}=M.discount(price,off);
        return [money(paid),"Sale price before tax",bar("Original price",price,price,money(price),1)+bar("Sale price",paid,price,money(paid))+bar("You save",saved,price,money(saved),2),
          ["Start with "+money(price)+".","Pay "+(100-off)+"% of the original price.","Round the sale price to the nearest cent. The difference is "+money(saved)+"."]];
      }
    },
    ratio:{
      name:"Ratios",title:"Mix a batch of lemonade",context:"Keep the recipe’s proportions as you change the batch size.",
      fields:[field("Water parts",3,1,30),field("Syrup parts",1,1,30),field("Batch volume (mL)",800,1,10000,.01)],
      run([a,b,v]){
        const [water,syrup]=M.ratio(a,b,v);
        return [fmt(water)+" mL","Water for this batch",bar("Water",water,v,fmt(water)+" mL")+bar("Syrup",syrup,v,fmt(syrup)+" mL",1),
          ["The recipe has "+(+a + +b)+" equal parts.","Divide "+fmt(v)+" mL by the total parts to find one part.","Use "+a+" parts water and "+b+" parts syrup. Displayed volumes are rounded to two decimals."]];
      }
    },
    fraction:{
      name:"Fractions",title:"How much of a whole?",context:"Each strip is one whole sheet, cut into equal pieces.",
      fields:[field("Selected pieces",3,0,24),field("Pieces per whole",4,1,12)],
      run([a,b]){
        const r=M.fraction(a,b);
        const strips=Array.from({length:Math.max(1,Math.ceil(r.quotient))},(_,i)=>'<div class="ed-strip" style="--parts:'+b+'">'+Array.from({length:b},(_,j)=>'<i class="'+(i*b+j<a?'ed-mark':'')+'"></i>').join("")+'</div>').join("");
        return [a+" / "+b,fmt(r.quotient)+" wholes (rounded)",'<div class="ed-strips" aria-hidden="true">'+strips+'</div><p>Striped pieces are selected. Each row contains '+b+' pieces.</p>',
        ["Split one sheet into "+b+" equal pieces.","Count "+a+" pieces across as many sheets as needed.","That covers "+r.full+" whole sheets and "+r.rest+" extra pieces."]];
      }
    },
    unit:{
      name:"Unit price",title:"Which pack costs less?",context:"Compare the price of equal weights, even when the packs differ.",
      fields:[dollars("Pack A price ($)",3.75),field("Pack A weight (g)",250,1,100000,.01),dollars("Pack B price ($)",6),field("Pack B weight (g)",500,1,100000,.01)],
      run([a,b,c,d]){
        const x=M.unit(a,b),y=M.unit(c,d), label=Math.abs(x-y)<1e-12?"Equal prices":x<y?"Pack A":"Pack B";
        return [label,"Lowest cost per 100 g",bar("Pack A",x,Math.max(x,y),money(x)+" / 100 g")+bar("Pack B",y,Math.max(x,y),money(y)+" / 100 g",1),["Divide each price by its weight in grams.","Multiply by 100 to compare equal 100 g portions.","The comparison uses the unrounded costs. Labels show the nearest cent."]];
      }
    },
    budget:{
      name:"Budget",title:"Where will my money go?",context:"Set two shares of your monthly income. The rest is flexible spending.",
      fields:[dollars("Monthly income ($)",1200),field("Essentials (%)",50,0,100),field("Savings (%)",20,0,100)],
      run([total,f,s]){
        const values=M.budget(total,f,s);
        return [money(values[2]),"Available for flexible spending",values.map((v,i)=>bar(["Essentials","Savings","Flexible spending"][i],v,total,money(v),i)).join(""),["Reserve "+f+"% for essentials.","Reserve another "+s+"% for savings.","The remaining "+(100-f-s)+"% is flexible. Cent rounding keeps the three amounts equal to your income."]];
      }
    },
    rate:{
      name:"Rate of change",title:"How quickly did it change?",context:"Compare two temperature readings over a known time interval.",
      fields:[field("Starting temperature (°C)",12,-100,150,.01),field("Ending temperature (°C)",20,-100,150,.01),field("Elapsed hours",4,.01,1000,.01)],
      run([a,b,t]){
        const v=M.rate(a,b,t), y1=v>0?78:v<0?22:50, y2=100-y1;
        const plot='<svg class="ed-rate" aria-hidden="true" viewBox="0 0 300 100"><path d="M10 90H290 M10 50H290 M10 10H290" fill="none" stroke="currentColor" opacity=".15"/><path d="M12 '+y1+' L288 '+y2+'" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="12" cy="'+y1+'" r="5"/><circle cx="288" cy="'+y2+'" r="5"/></svg><div class="ed-ends"><b>Start · '+fmt(a)+' °C</b><b>'+fmt(t)+' h · '+fmt(b)+' °C</b></div>';
        return [fmt(v)+" °C/h","Average temperature change",plot,["Subtract the starting temperature from the ending temperature.","The change is "+fmt(b-a)+" °C over "+fmt(t)+" hours.","Divide the change by elapsed hours. The line connects the two readings."]];
      }
    },
    probability:{
      name:"Probability",title:"What might happen by chance?",context:"Try repeated independent draws with the same chance of success.",
      fields:[field("Chance of a hit (%)",50,0,100),field("Number of draws",100,1,10000)],
      run([p,n],sample){
        M.percent(p,"chance"); M.quantity(n,"trials",1,10000,true);
        const expected=n*p/100;
        return [sample?fmt(sample.hits)+" hits":fmt(expected)+" hits",sample?"Observed in "+fmt(n)+" draws":"Expected on average",
          bar("Expected hits",expected,n,fmt(expected),1)+(sample?bar("Observed hits",sample.hits,n,fmt(sample.hits))+bar("Observed misses",sample.misses,n,fmt(sample.misses),2):""),
          ["Each draw has a "+p+"% chance of a hit.","Over "+fmt(n)+" draws, the expected count is "+fmt(expected)+".","Run the draws to see one random outcome. Repeated runs can give different counts."]];
      }
    }
  };
  window.mountEveryday = function(root) {
    let current="discount",sample=null;
    const memory={};
    root.innerHTML='<div class="ed"><nav class="ed-tools" aria-label="Everyday tools"></nav><div class="ed-layout"><section class="ed-editor"></section><section class="ed-figure" aria-label="Visual result"><p class="ed-kicker">VISUAL RESULT</p><output class="ed-result" aria-live="polite"></output><div class="ed-chart"></div></section></div><details class="ed-details"><summary>See the steps</summary><ol></ol></details></div>';
    const $=s=>root.querySelector(s);
    Object.entries(tools).forEach(([id,t])=>{
      const b=document.createElement("button"); b.type="button"; b.textContent=t.name;
      b.dataset.id=id; b.onclick=()=>{current=id;sample=null;render();}; $(".ed-tools").append(b);
    });
    function update(){
      const inputs=Array.from(root.querySelectorAll(".ed-editor input"));
      const vals=inputs.map(i=>i.value);
      memory[current]=vals;
      const error=$(".ed-error"),button=$(".ed-run");
      try {
        inputs.forEach(input=>{
          input.removeAttribute("aria-invalid");
          if(!input.validity.valid || input.value===""){
            input.setAttribute("aria-invalid","true");
            throw Error("Enter "+input.labels[0].textContent+" between "+input.min+" and "+input.max+" in steps of "+input.step+".");
          }
        });
        const [value,caption,chart,steps]=tools[current].run(vals,sample);
        error.textContent=""; if(button)button.disabled=false;
        $(".ed-result").innerHTML='<strong>'+value+'</strong><span>'+caption+'</span>';
        $(".ed-chart").innerHTML=chart; $(".ed-details").hidden=false;
        $(".ed-details ol").innerHTML=steps.map(x=>"<li>"+x+"</li>").join("");
      } catch(e) {
        error.textContent=e.message; if(button)button.disabled=true;
        $(".ed-result").textContent="Check the values to see a result.";
        $(".ed-chart").replaceChildren(); $(".ed-details").hidden=true;
      }
    }
    function render() {
      for (const b of root.querySelectorAll(".ed-tools button")) b.setAttribute("aria-pressed",String(current===b.dataset.id));
      const t=tools[current];
      $(".ed-details").open=false;
      $(".ed-editor").innerHTML='<h2>'+t.title+'</h2><p>'+t.context+'</p><div class="ed-fields">'+t.fields.map((f,i)=>'<div><label for="ed-v'+i+'">'+f.name+'</label><input type="number" id="ed-v'+i+'" min="'+f.min+'" max="'+f.max+'" step="'+f.step+'" required aria-describedby="ed-error"></div>').join("")+'</div><div id="ed-error" class="ed-error" role="status"></div><div class="ed-actions">'+(current==="probability"?'<button class="ed-run">Run draws</button>':'')+'<button class="ed-reset">Reset example</button></div>';
      root.querySelectorAll(".ed-editor input").forEach((input,i)=>{
        input.value=memory[current]?.[i]??t.fields[i].value;
        input.oninput=()=>{sample=null;update();};
      });
      $(".ed-reset").onclick=()=>{delete memory[current];sample=null;render();$(".ed-reset").focus();};
      if($(".ed-run"))$(".ed-run").onclick=()=>{sample=M.simulate(...memory[current]);update();};
      update();
    }
    render();
  };
})();
