/* Admin front-end demo logic.
   WARNING: Client-side admin auth is insecure — use a server backend for real apps. */

(function(){
  const ADMIN_PW = 'royal-admin-2025'; // demo password (change locally)
  const loginForm = document.getElementById('adminLoginForm');
  const loginStatus = document.getElementById('adminLoginStatus');
  const adminUI = document.getElementById('adminUI');
  const logoutBtn = document.getElementById('logoutAdmin');
  const adminTableBody = document.querySelector('#adminTable tbody');
  const adminOrdersEl = document.getElementById('adminOrders');
  const addForm = document.getElementById('adminAddForm');

  function loadMenu(){ return JSON.parse(localStorage.getItem('royal_cafe_menu')||'[]'); }
  function saveMenu(m){ localStorage.setItem('royal_cafe_menu', JSON.stringify(m)); }
  function loadOrders(){ return JSON.parse(localStorage.getItem('royal_cafe_orders')||'[]'); }

  function renderItems(){
    const menu = loadMenu();
    adminTableBody.innerHTML = '';
    menu.forEach(it=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${it.name}</td><td>${it.price} Tk</td>
        <td style="text-align:right">
          <button class="small-btn edit" data-id="${it.id}">Edit</button>
          <button class="small-btn del" data-id="${it.id}">Remove</button>
        </td>`;
      adminTableBody.appendChild(tr);
    });
  }

  function renderOrders(){
    const orders = loadOrders();
    adminOrdersEl.innerHTML = '';
    if(!orders.length) adminOrdersEl.textContent = 'No orders yet.';
    orders.forEach(o=>{
      const d = document.createElement('div');
      d.style.borderBottom='1px solid #eee'; d.style.padding='8px 0';
      d.innerHTML = `<strong>Order #${o.id}</strong> — ${new Date(o.createdAt).toLocaleString()}<div>Items: ${o.items.map(i=>i.name+' x'+i.qty).join(', ')}</div><div>Total: ${o.total} Tk</div>`;
      adminOrdersEl.appendChild(d);
    });
  }

  function requireAuth(){
    const ok = sessionStorage.getItem('rc_admin_ok') === '1';
    adminUI.classList.toggle('hidden', !ok);
    return ok;
  }

  loginForm && loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    const pw = (new FormData(loginForm)).get('password');
    if(pw === ADMIN_PW){
      sessionStorage.setItem('rc_admin_ok','1');
      loginStatus.textContent = 'Logged in';
      loginForm.classList.add('hidden');
      adminUI.classList.remove('hidden');
      renderItems();
      renderOrders();
    } else loginStatus.textContent = 'Wrong password';
  });

  logoutBtn && logoutBtn.addEventListener('click', ()=>{
    sessionStorage.removeItem('rc_admin_ok');
    adminUI.classList.add('hidden');
    loginForm.classList.remove('hidden');
  });

  addForm && addForm.addEventListener('submit', function(e){
    e.preventDefault();
    const fd = new FormData(addForm);
    const nm = fd.get('name'), price = Number(fd.get('price')), img = fd.get('img'), desc = fd.get('desc');
    if(!nm || !price) return alert('Name + price required');
    const menu = loadMenu();
    menu.unshift({id:Date.now(),name:nm,price,img,desc});
    saveMenu(menu);
    addForm.reset();
    renderItems();
    alert('Added');
  });

  adminTableBody && adminTableBody.addEventListener('click', function(e){
    const btn = e.target.closest('button'); if(!btn) return;
    const id = Number(btn.dataset.id);
    if(btn.classList.contains('del')){
      if(!confirm('Delete item?')) return;
      let menu = loadMenu(); menu = menu.filter(x=>x.id !== id); saveMenu(menu); renderItems();
    } else if(btn.classList.contains('edit')){
      const menu = loadMenu(); const idx = menu.findIndex(x=>x.id===id);
      if(idx===-1) return;
      const newName = prompt('New name', menu[idx].name); if(newName){ menu[idx].name = newName; saveMenu(menu); renderItems(); }
    }
  });

  // On page load: hide admin UI unless session set
  document.addEventListener('DOMContentLoaded', ()=>{ requireAuth(); });
})();
