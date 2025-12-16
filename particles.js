// Lightweight coffee-bean particles using divs (works well on pages with #beans)
(function(){
  const root = document.getElementById('beans');
  if(!root) return;
  const beanImg = 'https://i.imgurcom/3G6z2qV.png';
  const count = 10;
  for(let i=0;i<count;i++){
    const b = document.createElement('div'); b.className='bean';
    b.style.backgroundImage = `url(${beanImg})`;
    const size = 18 + Math.random()*46; b.style.width = size+'px'; b.style.height = size+'px';
    b.style.left = Math.random()*100+'%'; b.style.top = Math.random()*60+'%';
    const dur = 6 + Math.random()*12;
    b.style.transition = `transform ${dur}s linear, left ${dur}s linear, top ${dur}s linear`;
    root.appendChild(b);
    (function animate(el){
      const newLeft = Math.random()*100; const newTop = 60 + Math.random()*40;
      el.style.transform = `rotate(${Math.random()*360}deg) translateY(${Math.random()*10 - 5}px)`;
      el.style.left = newLeft + '%'; el.style.top = newTop + '%';
      setTimeout(()=>animate(el), dur*1000 + Math.random()*2000);
    })(b);
  }
})();
