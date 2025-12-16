/* Core Royal Cafe front-end logic
   - menu stored in localStorage 'royal_cafe_menu'
   - users stored in 'royal_cafe_users' (demo only)
   - cart stored in 'royal_cafe_cart'
   - orders stored in 'royal_cafe_orders'
   - messages stored in 'royal_cafe_messages'
*/

/* Utilities */
function load(key, fallback){ try{ const v = localStorage.getItem(key); return v?JSON.parse(v):fallback }catch(e){return fallback} }
function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)) }catch(e){} }
function el(sel){ return document.querySelector(sel) }
function els(sel){ return Array.from(document.querySelectorAll(sel)) }
function escapeHtml(s){ return String(s||'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[ch])) }

/* Default demo menu (only if none exists) */
const defaultMenu = [
  {id:1,name:'Cappuccino',price:150,img:'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=60',desc:'Classic frothy delight.'},
  {id:2,name:'Latte',price:180,img:'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=60',desc:'Smooth and milky.'},
  {id:3,name:'Mocha',price:200,img:'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=60',desc:'Chocolate + espresso.'}
];
if(!localStorage.getItem('royal_cafe_menu')) save('royal_cafe_menu', defaultMenu.slice());

/* Render helpers */
function renderHomeGrid(){
  const grid = el('#homeGrid');
  if(!grid) return;
  const menu = load('royal_cafe_menu', []);
  grid.innerHTML = '';
  const items = menu.slice(0,3);
  items.forEach(it=>{
    const div = document.createElement('div'); div.className='card menu-card reveal-on-scroll';
    div.innerHTML = `<img src="${escapeHtml(it.img)}" alt="${escapeHtml(it.name)}"><h4>${escapeHtml(it.name)}</h4><div class="meta"><div class="price">${it.price} Tk</div><button class="btn" data-id="${it.id}">Add</button></div>`;
    grid.appendChild(div);
  });
}

function renderMenuGrid(){
  const grid = el('#menuGrid');
  if(!grid) return;
  const menu = load('royal_cafe_menu', []);
  grid.innerHTML = '';
  menu.forEach(it=>{
    const card = document.createElement('article'); card.className='card menu-card reveal-on-scroll';
    card.innerHTML = `<img src="${escapeHtml(it.img)}" alt="${escapeHtml(it.name)}"><h4>${escapeHtml(it.name)}</h4><div style="color:var(--muted);font-size:13px">${escapeHtml(it.desc||'')}</div><div class="meta"><div class="price">${it.price} Tk</div><div><button class="btn add-to-cart" data-id="${it.id}">Add to cart</button></div></div>`;
    grid.appendChild(card);
  });
}

/* Cart operations */
function getCart(){ return load('royal_cafe_cart', []) }
function saveCart(c){ save('royal_cafe_cart', c); renderCartCount(); }
function addToCart(id){
  const menu = load('royal_cafe_menu', []);
  const item = menu.find(m=>m.id==id);
  if(!item) return alert('Item not found');
  const cart = getCart();
  const existing = cart.find(c=>c.id==id);
  if(existing) existing.qty++;
  else cart.push({id:item.id,name:item.name,price:item.price,qty:1});
  saveCart(cart);
  alert(`${item.name} added to cart`);
}

/* Render cart count in header */
function renderCartCount(){
  const countEl = els('#cartCount');
  const cart = getCart();
  const qty = cart.reduce((s,i)=>s+i.qty,0);
  countEl.forEach(e=>e.textContent = qty);
}

/* Cart page rendering */
function renderCartPage(){
  const list = el('#cartList');
  if(!list) return;
  const cart = getCart();
  if(!cart.length){ list.innerHTML = '<p>Your cart is empty.</p>'; return; }
  list.innerHTML = '';
  const ul = document.createElement('ul'); ul.style.listStyle='none'; ul.style.padding=0;
  let total = 0;
  cart.forEach(item=>{
    total += item.price*item.qty;
    const li = document.createElement('li'); li.style.padding='8px 0';
    li.innerHTML = `${escapeHtml(item.name)} — ${item.qty} x ${item.price} Tk <button class="small-btn" data-id="${item.id}" data-action="dec">-</button> <button class="small-btn" data-id="${item.id}" data-action="inc">+</button>`;
    ul.appendChild(li);
  });
  const tot = document.createElement('div'); tot.style.marginTop='8px'; tot.innerHTML = `<strong>Total: ${total} Tk</strong>`;
  list.appendChild(ul); list.appendChild(tot);

  // attach controls
  list.addEventListener('click', function(ev){
    const btn = ev.target.closest('button'); if(!btn) return;
    const id = Number(btn.dataset.id), action = btn.dataset.action;
    let cart = getCart(); const idx = cart.findIndex(c=>c.id==id);
    if(idx===-1) return;
    if(action==='inc') cart[idx].qty++;
    if(action==='dec'){ cart[idx].qty--; if(cart[idx].qty<=0) cart.splice(idx,1); }
    saveCart(cart); renderCartPage();
  }, {once:false});
}

/* Checkout -> store order */
function checkout(){
  const cart = getCart();
  if(!cart.length) return alert('Cart empty');
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const orders = load('royal_cafe_orders', []);
  const order = {id:Date.now(), items:cart, total, createdAt:new Date().toISOString()};
  orders.unshift(order); save('royal_cafe_orders', orders);
  save('royal_cafe_cart', []); renderCartCount();
  el('#orderStatus') && (el('#orderStatus').textContent = 'Order placed — thank you!');
  alert('Order placed! Order id: ' + order.id);
}

/* Signup/Login (demo) */
function signupHandler(){
  const f = el('#signupForm'); if(!f) return;
  f.addEventListener('submit', function(e){
    e.preventDefault();
    const fd = new FormData(f); const name = fd.get('name'), email = fd.get('email'), pw = fd.get('password');
    const users = load('royal_cafe_users', []);
    if(users.find(u=>u.email === email)) return el('#signupStatus').textContent = 'Email already used';
    users.push({id:Date.now(),name,email,password:btoa(pw)}); save('royal_cafe_users', users);
    el('#signupStatus').textContent = 'Account created — you can login';
    f.reset();
  });
}
function loginHandler(){
  const f = el('#loginForm'); if(!f) return;
  f.addEventListener('submit', function(e){
    e.preventDefault();
    const fd = new FormData(f); const email = fd.get('email'), pw = fd.get('password');
    const users = load('royal_cafe_users', []);
    const u = users.find(x=>x.email===email && atob(x.password)===pw);
    if(u){ localStorage.setItem('rc_user', JSON.stringify({id:u.id,name:u.name,email:u.email})); el('#loginStatus').textContent = 'Logged in'; window.location.href='index.html'; }
    else el('#loginStatus').textContent = 'Invalid credentials';
  });
}

/* Contact messages */
function contactHandler(){
  const f = el('#contactForm'); if(!f) return;
  f.addEventListener('submit', function(e){
    e.preventDefault();
    const fd = new FormData(f); const name = fd.get('name'), email = fd.get('email'), message = fd.get('message');
    const messages = load('royal_cafe_messages', []); messages.unshift({id:Date.now(),name,email,message,createdAt:new Date().toISOString()}); save('royal_cafe_messages', messages);
    el('#formStatus') && (el('#formStatus').textContent = 'Message saved — thank you!');
    f.reset();
    renderMessages();
  });
}
function renderMessages(){
  const ul = el('#messagesList'); if(!ul) return;
  const messages = load('royal_cafe_messages', []);
  ul.innerHTML = '';
  if(!messages.length) return ul.innerHTML = '<li style="color:var(--muted)">No messages yet.</li>';
  messages.forEach(m=>{
    const li = document.createElement('li'); li.style.marginBottom='10px'; li.innerHTML = `<strong>${escapeHtml(m.name)}</strong> <small style="color:var(--muted)">${escapeHtml(m.email)}</small><div>${escapeHtml(m.message)}</div><div style="font-size:12px;color:var(--muted)">${new Date(m.createdAt).toLocaleString()}</div>`;
    ul.appendChild(li);
  });
}

/* Scroll reveal */
function initScrollReveal(){
  const items = document.querySelectorAll('.reveal-on-scroll');
  if(!items.length) return;
  const obs = new IntersectionObserver((entries, o)=>{
    entries.forEach(ent=>{ if(ent.isIntersecting){ ent.target.classList.add('reveal'); o.unobserve(ent.target); } });
  },{threshold:0.12});
  items.forEach(i=>obs.observe(i));
}

/* Floating beans are managed in particles.js */

/* Event wiring on DOM ready */
document.addEventListener('DOMContentLoaded', function(){
  // year spans
  els('#year, #year2, #year3, #year4, #year5, #year6, #year7').forEach(s=>s.textContent = new Date().getFullYear());

  // Renderers
  renderHomeGrid();
  renderMenuGrid();
  renderCartCount();
  renderMessages();
  initScrollReveal();

  // Home / Menu Add buttons (delegation)
  document.body.addEventListener('click', function(e){
    const add = e.target.closest('.add-to-cart, .btn[data-id]');
    if(add){
      const id = add.dataset.id;
      addToCart(Number(id));
      renderCartCount();
      return;
    }
  });

  // Menu specific page
  renderMenuGrid();

  // Cart page
  renderCartPage();

  // Checkout button
  const checkoutBtn = el('#checkoutBtn'); if(checkoutBtn) checkoutBtn.addEventListener('click', checkout);
  const clearCartBtn = el('#clearCart'); if(clearCartBtn) clearCartBtn.addEventListener('click', ()=>{ if(confirm('Clear cart?')){ save('royal_cafe_cart', []); renderCartCount(); renderCartPage(); } });

  // Signup / Login
  signupHandler(); loginHandler();

  // Contact
  contactHandler();

  // Add to cart from home grid buttons (they use data-id on .btn)
  document.addEventListener('click', function(e){
    const b = e.target.closest('.btn[data-id]');
    if(b){ addToCart(Number(b.dataset.id)); renderCartCount(); }
  });

  // Preloader hide
  window.addEventListener('load', ()=>{ const pre = document.getElementById('preloader'); if(pre){ pre.style.transition='opacity .5s'; pre.style.opacity='0'; setTimeout(()=>pre.remove(),600); }});
});
