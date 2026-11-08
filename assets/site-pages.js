(function () {
  var pageView;
  var main;

  function shell(title, intro, body) {
    return '<section class="page-shell"><div class="eyebrow">DeliGo Eats</div><h1>' + title + '</h1><p class="page-intro">' + intro + '</p>' + body + '</section>';
  }

  function renderRestaurantsPage() {
    pageView.innerHTML = shell('Restaurantes ativos', 'Encontre restaurantes disponíveis, filtre por categoria e veja os pratos publicados.', '<div class="page-toolbar"><input id="pageRestaurantSearch" placeholder="Pesquisar restaurante"><select id="pageCategory"><option value="">Todas as categorias</option><option>Fast Food</option><option>Lanches</option><option>Carnes</option><option>Saudável</option><option>Mariscos</option><option>Bebidas</option><option>Refeições</option></select></div><div class="restaurants" id="pageRestaurants"><div class="empty">A carregar restaurantes ativos…</div></div>');
    fetchRestaurantsPage();
    document.getElementById('pageRestaurantSearch').addEventListener('input', fetchRestaurantsPage);
    document.getElementById('pageCategory').addEventListener('change', fetchRestaurantsPage);
  }

  async function fetchRestaurantsPage() {
    var target = document.getElementById('pageRestaurants');
    if (!target) return;
    try {
      var response = await fetch(SUPA + '/rest/v1/rpc/get_public_restaurants', { method: 'POST', headers: headers, body: JSON.stringify({ p_search: null, p_category: null, p_neighborhood: null, p_city: null, p_sort_by: 'rating', p_limit: 100, p_offset: 0 }) });
      var search = (document.getElementById('pageRestaurantSearch').value || '').toLowerCase();
      var category = document.getElementById('pageCategory').value;
      var items = (await response.json()).filter(function (item) { return item.is_open === true && (!search || (item.name + ' ' + (item.description || '')).toLowerCase().includes(search)) && (!category || item.category === category); });
      target.innerHTML = items.length ? items.map(function (item) { return '<article class="restaurant" onclick="openRestaurant(\'' + item.id + '\')"><img class="rest-img" src="' + (item.image_url || 'assets/deligo-icon.png') + '"><div class="rest-body"><h3>' + item.name + '</h3><div class="meta"><span>' + (item.category || 'Restaurante') + ' · ' + (item.neighborhood || item.city || 'Maputo') + '</span><span class="rating">★ ' + (item.rating || 'Novo') + '</span></div></div></article>'; }).join('') : '<div class="empty">Nenhum restaurante ativo encontrado.</div>';
    } catch (error) { target.innerHTML = '<div class="empty">Não foi possível carregar os restaurantes agora.</div>'; }
  }

  function renderPage(route) {
    if (route === 'home' || route === 'explore' || route === 'how' || route === 'partners') {
      main.style.display = '';
      pageView.style.display = 'none';
      if (route !== 'home') document.getElementById(route)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    main.style.display = 'none';
    pageView.style.display = 'block';
    if (route === 'restaurantes') return renderRestaurantsPage();
    if (route === 'parceiros') return pageView.innerHTML = shell('Para parceiros', 'Faça parte da rede DeliGo e venda mais com levantamentos rápidos.', '<div class="info-grid"><div><h2>Como cadastrar</h2><p>Crie a sua conta de parceiro, envie os dados do restaurante e aguarde a validação da equipa DeliGo.</p></div><div><h2>Comissões claras</h2><p>As condições comerciais, comissões e prazos de pagamento são apresentados durante o cadastro e no contrato do parceiro.</p></div><div><h2>Pagamentos</h2><p>Depois da confirmação das vendas, os levantamentos são processados pelos canais disponíveis, incluindo M-Pesa e e-Mola.</p></div></div><a class="red page-button" href="/app/#/register?role=restaurant">Cadastrar restaurante</a>');
    if (route === 'entregadores') return pageView.innerHTML = shell('Para entregadores', 'Trabalhe com a DeliGo e faça entregas na sua zona.', '<div class="info-grid"><div><h2>Requisitos</h2><p>Documento de identificação, telefone ativo, meio de transporte e disponibilidade para realizar entregas.</p></div><div><h2>Como se inscrever</h2><p>Crie a sua conta, escolha o perfil de entregador e envie os dados solicitados para análise.</p></div><div><h2>Operação simples</h2><p>Receba pedidos, acompanhe a rota e consulte o seu histórico através do app web.</p></div></div><a class="red page-button" href="/app/#/register?role=courier">Inscrever-me como entregador</a>');
    if (route === 'contacto') return pageView.innerHTML = shell('Contacto', 'Estamos disponíveis para clientes, parceiros e entregadores.', '<div class="contact-grid"><div><h2>Fale connosco</h2><p>Email geral: <a href="mailto:geral@deligotriunfal.site">geral@deligotriunfal.site</a></p><p>Contactos, carreiras e parcerias: <a href="https://deligotriunfal.site" target="_blank" rel="noopener">deligotriunfal.site</a></p></div><form onsubmit="event.preventDefault();this.reset();document.getElementById(\'contactSuccess\').textContent=\'Mensagem preparada. A nossa equipa responderá em breve.\'"><input required placeholder="Nome"><input required type="email" placeholder="Email"><textarea required placeholder="Como podemos ajudar?"></textarea><button class="red" type="submit">Enviar mensagem</button><p id="contactSuccess"></p></form></div>');
    if (route === 'faq') return pageView.innerHTML = shell('Perguntas frequentes', 'Respostas rápidas sobre pedidos, pagamentos, parceiros e entregas.', '<div class="faq"><details open><summary>Posso ver menus sem criar conta?</summary><p>Sim. Pode explorar restaurantes e preparar o carrinho. Para finalizar o pagamento, precisa entrar ou criar conta.</p></details><details><summary>Quais meios de pagamento estão disponíveis?</summary><p>O DeliGo suporta os canais indicados no checkout, incluindo M-Pesa e e-Mola, conforme disponibilidade.</p></details><details><summary>Como faço para cadastrar um restaurante?</summary><p>Aceda à página Para parceiros ou use o botão Quero ser parceiro.</p></details><details><summary>Como posso ser entregador?</summary><p>Abra Para entregadores e faça o cadastro com o seu perfil de estafeta.</p></details></div>');
    if (route === 'termos') return pageView.innerHTML = shell('Termos de utilização', 'Condições gerais para utilizar o DeliGo Eats.', '<div class="legal-copy"><p>O DeliGo Eats conecta clientes, restaurantes e entregadores. Ao utilizar o serviço, deve fornecer dados verdadeiros e utilizar a plataforma de forma responsável.</p><p>Pedidos, pagamentos, cancelamentos e entregas dependem da disponibilidade dos parceiros e das condições apresentadas no checkout.</p></div>');
    if (route === 'privacidade') return pageView.innerHTML = shell('Política de privacidade', 'Como tratamos os dados necessários para operar o DeliGo Eats.', '<div class="legal-copy"><p>Utilizamos os dados de conta, contacto, pedido e pagamento apenas para autenticação, processamento, suporte, segurança e melhoria do serviço.</p><p>Não coloque dados completos de cartões ou códigos secretos no formulário de contacto. Para dúvidas sobre privacidade, escreva para <a href="mailto:geral@deligotriunfal.site">geral@deligotriunfal.site</a>.</p></div>');
  }

  function navigate() { renderPage((location.hash || '#home').slice(1).split('?')[0] || 'home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  window.addEventListener('DOMContentLoaded', function () {
    var style = document.createElement('style');
    style.textContent = '.page-shell{max-width:1100px;margin:0 auto;padding:55px 28px 80px}.page-shell h1{font-size:clamp(38px,6vw,68px);margin:0 0 12px}.page-intro{font-size:18px;color:var(--mut);max-width:700px;line-height:1.6}.page-toolbar{display:flex;gap:12px;margin:28px 0;flex-wrap:wrap}.page-toolbar input,.page-toolbar select,.contact-grid input,.contact-grid textarea{border:1px solid var(--line);border-radius:12px;padding:13px;background:#fff;font:inherit}.page-toolbar input{flex:1;min-width:220px}.info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:34px 0}.info-grid>div,.faq details,.legal-copy,.contact-grid>div,.contact-grid form{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px}.info-grid h2{font-size:20px}.page-button{display:inline-block;margin-top:8px}.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:30px}.contact-grid form{display:grid;gap:12px}.contact-grid textarea{min-height:130px;resize:vertical}.faq{display:grid;gap:12px;margin-top:28px;max-width:800px}.faq summary{cursor:pointer;font-weight:800}.faq p{color:var(--mut);line-height:1.6}.legal-copy{max-width:800px;line-height:1.7;margin-top:28px}@media(max-width:800px){.info-grid,.contact-grid{grid-template-columns:1fr}.page-shell{padding:35px 16px 60px}nav{gap:12px;overflow:auto;white-space:nowrap}}';
    document.head.appendChild(style);
    main = document.querySelector('main');
    pageView = document.createElement('div');
    pageView.id = 'pageView';
    pageView.style.display = 'none';
    main.parentNode.insertBefore(pageView, main);
    var nav = document.querySelector('nav');
    if (nav) nav.innerHTML = '<a href="#home">Início</a><a href="#restaurantes">Restaurantes</a><a href="#parceiros">Parceiros</a><a href="#entregadores">Entregadores</a><a href="#faq">FAQ</a><a href="#contacto">Contacto</a>';
    document.querySelector('.legal')?.insertAdjacentHTML('afterbegin', '<a href="#termos">Termos</a><a href="#privacidade">Privacidade</a>');
    window.addEventListener('hashchange', navigate);
    navigate();
  });
})();
