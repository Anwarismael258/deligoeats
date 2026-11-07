(function () {
  function setupBrandAndFooter() {
    var logo = document.querySelector('.logo');
    if (logo) {
      logo.setAttribute('aria-label', 'DeliGo Eats');
      logo.querySelectorAll('span, em').forEach(function (node) { node.remove(); });
      var img = logo.querySelector('img');
      if (img) img.alt = 'DeliGo Eats';
    }
    var legal = document.querySelector('.legal');
    if (legal && !legal.dataset.extended) {
      legal.dataset.extended = '1';
      legal.insertAdjacentHTML('afterbegin',
        '<a href="https://deligotriunfal.site" target="_blank" rel="noopener">Contactos, carreiras e parcerias</a>' +
        '<a href="https://sarca.digital" target="_blank" rel="noopener">Uber / SARCA</a>' +
        '<a href="https://www.m24solutions.online/" target="_blank" rel="noopener">Profissionais · Mestre24</a>' +
        '<a href="mailto:geral@deligotriunfal.site">geral@deligotriunfal.site</a>');
    }
  }

  var originalAddToCart = window.addToCart;
  var originalOpenCart = window.openCart;
  var currentRestaurantId = null;
  var currentRestaurantName = '';

  window.openRestaurant = async function (id) {
    var restaurant = (window.allRestaurants || []).find(function (item) { return item.id === id; });
    currentRestaurantId = id;
    currentRestaurantName = restaurant ? restaurant.name : 'Restaurante';
    return originalOpenRestaurant(id);
  };

  window.addToCart = function (id, name, price, button) {
    if (window.cart && window.cart.length && currentRestaurantId && window.cart[0].restaurantId && window.cart[0].restaurantId !== currentRestaurantId) {
      alert('O carrinho só pode conter produtos do mesmo restaurante. Remova os itens atuais para continuar.');
      return;
    }
    if (!window.cart) window.cart = [];
    window.cart.push({ id: id, name: name, price: price, restaurantId: currentRestaurantId, restaurantName: currentRestaurantName });
    document.getElementById('count').textContent = window.cart.length;
    document.getElementById('cartBtn').classList.add('show', 'bump');
    setTimeout(function () { document.getElementById('cartBtn').classList.remove('bump'); }, 450);
    if (button && button.closest('.menu-item').animate) button.closest('.menu-item').animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], 400);
  };

  window.openCart = function () {
    if (!window.cart || !window.cart.length) return originalOpenCart();
    modalTitle.textContent = 'Seu carrinho';
    modalSub.textContent = window.cart.length + ' item(ns) selecionado(s)';
    menu.innerHTML = '<div class="cart-restaurant">Restaurante: <b>' + (window.cart[0].restaurantName || 'DeliGo Eats') + '</b></div>' +
      window.cart.map(function (item, index) {
        return '<div class="menu-item"><div><h4>' + item.name + '</h4><p>' + item.price.toFixed(2) + ' MT</p></div><button class="ghost" onclick="removeFromCart(' + index + ')">Remover</button></div>';
      }).join('') +
      '<div class="auth-note"><b>Total: ' + window.cart.reduce(function (sum, item) { return sum + item.price; }, 0).toFixed(2) + ' MT</b><br><br>O pagamento por M-Pesa ou e-Mola fica disponível depois de entrar ou criar conta.<br><br><button class="red" onclick="goApp(\'/app/#/login?role=client\',this)">Entrar para pagar</button> <button class="ghost" onclick="goApp(\'/app/#/register?role=client\',this)">Criar conta</button></div>';
    modal.classList.add('open');
  };

  window.removeFromCart = function (index) {
    window.cart.splice(index, 1);
    document.getElementById('count').textContent = window.cart.length;
    if (window.cart.length) window.openCart(); else closeModal();
  };

  window.filterRestaurants = async function () {
    var query = (document.getElementById('search').value || '').trim().toLowerCase();
    var restaurants = (window.allRestaurants || []);
    if (query) {
      document.getElementById('restaurants').innerHTML = '<div class="empty">A pesquisar restaurantes e pratos…</div>';
      var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwbXNndmtkanpvaWR2eWl3d2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzc5ODUsImV4cCI6MjEwMDkxMzk4NX0.SP7BFuXEVjsd7kCFROcJ72XAorGCYEJgR-1HmzGjM3M';
      try {
        if (!restaurants.length) {
          var restaurantResponse = await fetch('https://tpmsgvkdjzoidvyiwwfk.supabase.co/rest/v1/rpc/get_public_restaurants', { method: 'POST', headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_search: null, p_category: null, p_neighborhood: null, p_city: null, p_sort_by: 'rating', p_limit: 100, p_offset: 0 }) });
          restaurants = (await restaurantResponse.json()).filter(function (item) { return item.is_open === true; });
        }
        var response = await fetch('https://tpmsgvkdjzoidvyiwwfk.supabase.co/rest/v1/menu_items?select=name,description,price,image_url,restaurant_id&is_available=eq.true&is_public=eq.true&name=ilike.*' + encodeURIComponent(query) + '*&limit=40', { headers: { apikey: key, Authorization: 'Bearer ' + key } });
        var products = await response.json();
        var matches = restaurants.filter(function (item) { return (item.name + ' ' + (item.category || '') + ' ' + (item.description || '')).toLowerCase().includes(query); });
        if (matches.length) renderRestaurants(matches);
        else document.getElementById('restaurants').innerHTML = products.length ? products.map(function (item) { return '<article class="restaurant"><img class="rest-img" src="' + (item.image_url || 'assets/deligo-icon.png') + '"><div class="rest-body"><h3>' + item.name + '</h3><div class="meta"><span>Prato disponível</span><span class="rating">' + Number(item.price || 0).toFixed(2) + ' MT</span></div></div></article>'; }).join('') : '<div class="empty">Nenhum restaurante ou prato encontrado.</div>';
      } catch (error) { renderRestaurants(restaurants.filter(function (item) { return item.name.toLowerCase().includes(query); })); }
    } else renderRestaurants(restaurants);
  };

  window.addEventListener('DOMContentLoaded', setupBrandAndFooter);
})();
