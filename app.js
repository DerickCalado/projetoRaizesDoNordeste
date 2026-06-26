// ==========================================
// DATA DEFINITIONS (MENU & STORES)
// ==========================================

const STORES = [
  { id: 'recife_centro', name: 'Recife Centro (Cozinha Completa)', region: 'PE', status: 'Aberto', schedule: '07:00 às 22:00', type: 'completa' },
  { id: 'olinda_historico', name: 'Olinda Histórico', region: 'PE', status: 'Aberto', schedule: '08:00 às 23:00', type: 'completa' },
  { id: 'caruaru_express', name: 'Caruaru Express (Reduzido)', region: 'PE', status: 'Aberto', schedule: '06:30 às 18:00', type: 'reduzido' },
  { id: 'salvador_barra', name: 'Salvador Barra (Cozinha Completa)', region: 'BA', status: 'Aberto', schedule: '08:00 às 22:00', type: 'completa' }
];

const PRODUCTS = [
  {
    id: 'cuscuz_carne_sol',
    name: 'Cuscuz com Carne de Sol',
    category: 'cuscuz',
    price: 18.90,
    desc: 'Cuscuz de milho flocoso cozido no vapor, recheado com generosa carne de sol desfiada e queijo coalho grelhado.',
    img: 'assets/cuscuz_recheado.png',
    badges: ['Mais Vendido', 'Regional'],
    modifierGroup: 'cuscuz_mods',
    availableIn: ['completa', 'reduzido']
  },
  {
    id: 'tapioca_coalho',
    name: 'Tapioca Rendada de Coalho',
    category: 'tapiocas',
    price: 14.50,
    desc: 'Tapioca com casquinha crocante de queijo coalho por fora, recheada com queijo derretido e manteiga de garrafa.',
    img: 'assets/tapioca_rendada.png',
    badges: ['Veggie'],
    modifierGroup: 'tapioca_mods',
    availableIn: ['completa', 'reduzido']
  },
  {
    id: 'bolo_macaxeira',
    name: 'Bolo de Macaxeira Cremoso',
    category: 'bolos',
    price: 9.90,
    desc: 'Tradicional bolo de mandioca (macaxeira) ralada com coco fresco, muito úmido e servido quentinho.',
    img: 'assets/bolo_macaxeira.png',
    badges: ['Caseiro'],
    modifierGroup: 'simple_mods',
    availableIn: ['completa']
  },
  {
    id: 'suco_caja',
    name: 'Suco Natural de Cajá',
    category: 'bebidas',
    price: 8.50,
    desc: 'Suco da fruta de cajá bem gelado, refrescante e com aquele azedinho característico do Nordeste.',
    img: 'assets/suco_caja.png',
    badges: ['Natural'],
    modifierGroup: 'drink_mods',
    availableIn: ['completa']
  }
];

const MODIFIER_GROUPS = {
  cuscuz_mods: {
    title: 'Personalize seu Cuscuz',
    options: [
      { name: 'Manteiga de Garrafa Extra', price: 2.00 },
      { name: 'Ovo Frito Caipira', price: 3.00 },
      { name: 'Coriandro (Coentro) Fresco', price: 0.00 }
    ]
  },
  tapioca_mods: {
    title: 'Opções da Tapioca',
    options: [
      { name: 'Coco Ralado Fresco', price: 1.50 },
      { name: 'Mel de Engenho', price: 2.50 }
    ]
  },
  drink_mods: {
    title: 'Adoçamento',
    options: [
      { name: 'Sem Açúcar', price: 0.00 },
      { name: 'Adoçante Stevia', price: 1.00 },
      { name: 'Açúcar Demerara', price: 0.00 }
    ]
  },
  simple_mods: {
    title: 'Adicionais',
    options: [
      { name: 'Cobertura de Leite Condensado', price: 3.00 }
    ]
  }
};

// ==========================================
// APP STATE
// ==========================================
let state = {
  serviceMode: 'delivery',      // 'delivery' ou 'pickup'
  selectedStore: STORES[0],     // default Recife Centro
  address: '',
  cart: [],
  fidelityJoined: false,
  fidelityConsent: false,
  currentOrder: null,
  activeModifiersProduct: null,
  systemDown: false,            // Flag de simulação de alta disponibilidade/queda
  user: null,                   // Objeto usuário { name, email, phone, cpf }
  selectedCategory: 'cuscuz'    // Categoria selecionada para filtro do cardápio
};

const MIN_PASSWORD_LENGTH = 8;
const CUSTOMER_ACCOUNTS = [
  {
    name: 'Dona Francisca',
    email: 'francisca@raizes.com',
    password: 'raizes123',
    phone: '(81) 99876-5432',
    cpf: '123.456.789-00'
  }
];

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initServiceMode();
  initAddressSearch();
  initStoreSelector();
  renderMenu();
  updateCartUI();
  updateAuthUI();

  // LGPD consent listener for registration button
  const regLgpdConsent = document.getElementById('reg-lgpd-consent');
  const regSubmitBtn = document.getElementById('reg-submit-btn');
  if (regLgpdConsent && regSubmitBtn) {
    regLgpdConsent.addEventListener('change', (e) => {
      regSubmitBtn.disabled = !e.target.checked;
    });
  }

  // Category navigation active toggle and in-place filtering
  const catLinks = document.querySelectorAll('.category-link');
  catLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      catLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Extract category from href (e.g. "#sec-cuscuz" -> "cuscuz")
      const href = link.getAttribute('href');
      let cat = 'cuscuz';
      if (href === '#sec-tapiocas') cat = 'tapiocas';
      if (href === '#sec-bolos') cat = 'bolos';
      if (href === '#sec-bebidas') cat = 'bebidas';

      state.selectedCategory = cat;
      renderMenu();
    });
  });
});

// ==========================================
// SERVICE MODE SELECTOR (Delivery vs. Pick-up)
// ==========================================
function initServiceMode() {
  const deliveryBtn = document.getElementById('btn-mode-delivery');
  const pickupBtn = document.getElementById('btn-mode-pickup');
  const deliveryContent = document.getElementById('mode-content-delivery');
  const pickupContent = document.getElementById('mode-content-pickup');

  deliveryBtn.addEventListener('click', () => {
    state.serviceMode = 'delivery';
    deliveryBtn.classList.add('active');
    pickupBtn.classList.remove('active');
    deliveryContent.style.display = 'block';
    pickupContent.style.display = 'none';
    updateCartUI();
  });

  pickupBtn.addEventListener('click', () => {
    state.serviceMode = 'pickup';
    pickupBtn.classList.add('active');
    deliveryBtn.classList.remove('active');
    pickupContent.style.display = 'block';
    deliveryContent.style.display = 'none';
    updateCartUI();
  });
}

// Address Input Simulator
function initAddressSearch() {
  const cepInput = document.getElementById('cep-input');
  const cepBtn = document.getElementById('cep-search-btn');
  const addressInfo = document.getElementById('address-display-info');

  cepBtn.addEventListener('click', () => {
    if (state.systemDown) {
      showToast('Erro de conexão. Sistema indisponível.', 'danger');
      return;
    }

    const cep = cepInput.value.replace(/\D/g, '');
    if (cep.length === 8) {
      state.address = `Rua do Sol, Bairro do Recife, Recife - PE (Proximidade calculada para CEP ${cep.substring(0,5)}-${cep.substring(5)})`;
      addressInfo.innerHTML = `
        <div style="background-color: var(--color-primary-light); padding: var(--space-sm); border-radius: var(--radius-md); margin-top: var(--space-sm);">
          <p style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-primary);">✓ Endereço Confirmado:</p>
          <p style="font-size: var(--font-size-sm); color: var(--color-text-main);">${state.address}</p>
        </div>
      `;
      showToast('Endereço localizado com sucesso!', 'success');
      updateCartUI();
    } else {
      showToast('Por favor, insira um CEP válido de 8 dígitos.', 'danger');
    }
  });
}

// Store Selection Simulation
function initStoreSelector() {
  const storeList = document.getElementById('store-list-container');
  
  STORES.forEach(store => {
    const card = document.createElement('div');
    card.className = `store-card ${state.selectedStore.id === store.id ? 'selected' : ''}`;
    card.setAttribute('data-id', store.id);
    card.style.cssText = `
      padding: var(--space-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-xs);
      cursor: pointer;
      background: var(--color-bg-white);
      transition: all var(--transition-fast);
    `;
    card.innerHTML = `
      <div class="flex justify-between items-center">
        <h4 style="margin: 0; font-size: var(--font-size-sm); color: var(--color-text-main);">${store.name}</h4>
        <span class="badge ${store.status === 'Aberto' ? 'badge-success' : 'badge-neutral'}">${store.status}</span>
      </div>
      <p style="margin: var(--space-2xs) 0 0 0; font-size: var(--font-size-xs); color: var(--color-text-muted);">
        Horário: ${store.schedule}
      </p>
      <p style="margin: 2px 0 0 0; font-size: var(--font-size-xs); font-style: italic; color: var(--color-primary);">
        Menu: ${store.type === 'completa' ? 'Cardápio Regional Completo' : 'Formato Expresso (Compacto)'}
      </p>
    `;

    card.addEventListener('click', () => {
      if (state.systemDown) {
        showToast('Erro de conexão. Sistema indisponível.', 'danger');
        return;
      }
      
      // Select store
      state.selectedStore = store;
      
      // Update UI selection
      document.querySelectorAll('.store-card').forEach(c => {
        c.classList.remove('selected');
      });
      card.classList.add('selected');

      showToast(`Loja selecionada: ${store.name}`, 'primary');
      renderMenu();
      updateCartUI();
    });

    storeList.appendChild(card);
  });
}

// ==========================================
// CARDÁPIO (MENU RENDER)
// ==========================================
function renderMenu() {
  const menuGrid = document.getElementById('menu-grid');
  if (!menuGrid) return;
  menuGrid.innerHTML = '';

  // Update header store display
  const activeStoreDisplay = document.getElementById('active-store-display');
  if (activeStoreDisplay) {
    activeStoreDisplay.innerText = state.selectedStore.name;
  }

  const activeStoreType = state.selectedStore.type;
  // Filter by both store availability and selected category
  const filteredProducts = PRODUCTS.filter(prod => 
    prod.availableIn.includes(activeStoreType) && 
    prod.category === state.selectedCategory
  );

  if (filteredProducts.length === 0) {
    menuGrid.innerHTML = `<p style="grid-column: span 3; text-align: center; color: var(--color-text-muted); padding: var(--space-lg) 0;">Nenhum produto desta categoria disponível nesta unidade.</p>`;
    return;
  }

  filteredProducts.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const badgesHtml = prod.badges.map(b => {
      let badgeClass = 'badge-primary';
      if (b === 'Veggie') badgeClass = 'badge-success';
      if (b === 'Mais Vendido') badgeClass = 'badge-secondary';
      return `<span class="badge ${badgeClass}">${b}</span>`;
    }).join(' ');

    card.innerHTML = `
      <div class="product-card-img-wrapper">
        <img class="product-card-img" src="${prod.img}" alt="${prod.name}" onerror="this.src='https://placehold.co/400x250/F5F1EB/2F2421?text=${encodeURIComponent(prod.name)}'">
        <div class="product-card-badges">${badgesHtml}</div>
      </div>
      <div class="product-card-body">
        <h3 class="product-card-title">${prod.name}</h3>
        <p class="product-card-desc">${prod.desc}</p>
        <div class="product-card-footer">
          <div class="product-card-price">R$ ${prod.price.toFixed(2)}</div>
          <button class="btn btn-primary btn-sm" onclick="openModifiersModal('${prod.id}')">Adicionar</button>
        </div>
      </div>
    `;

    menuGrid.appendChild(card);
  });
}

// ==========================================
// MODIFIERS MODAL
// ==========================================
window.openModifiersModal = function(productId) {
  if (state.systemDown) {
    showToast('Erro ao carregar modificadores. Sistema offline.', 'danger');
    return;
  }

  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  state.activeModifiersProduct = {
    product: prod,
    selectedModifiers: []
  };

  const modalBackdrop = document.getElementById('modifiers-modal');
  const modalTitle = document.getElementById('modal-product-title');
  const modalDesc = document.getElementById('modal-product-desc');
  const modifiersList = document.getElementById('modifiers-options-list');
  const modalPrice = document.getElementById('modal-total-price');

  modalTitle.innerText = prod.name;
  modalDesc.innerText = prod.desc;
  modalPrice.innerText = `Adicionar por R$ ${prod.price.toFixed(2)}`;

  // Load modifiers options
  const modGroup = MODIFIER_GROUPS[prod.modifierGroup];
  modifiersList.innerHTML = `
    <h4 style="font-size: var(--font-size-sm); margin-bottom: var(--space-sm); color: var(--color-text-main); font-family: var(--font-display);">
      ${modGroup.title}
    </h4>
  `;

  modGroup.options.forEach((opt, idx) => {
    const row = document.createElement('div');
    row.className = 'switch-group';
    row.innerHTML = `
      <div>
        <p style="font-size: var(--font-size-sm); font-weight: 500; margin: 0;">${opt.name}</p>
        <p style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin: 0;">
          ${opt.price > 0 ? `+ R$ ${opt.price.toFixed(2)}` : 'Grátis'}
        </p>
      </div>
      <label class="switch">
        <input type="checkbox" onchange="toggleModifier(${idx}, this.checked)">
        <span class="slider"></span>
      </label>
    `;
    modifiersList.appendChild(row);
  });

  modalBackdrop.classList.add('active');
};

window.closeModifiersModal = function() {
  const modalBackdrop = document.getElementById('modifiers-modal');
  modalBackdrop.classList.remove('active');
  state.activeModifiersProduct = null;
};

window.toggleModifier = function(idx, checked) {
  const active = state.activeModifiersProduct;
  if (!active) return;

  const modGroup = MODIFIER_GROUPS[active.product.modifierGroup];
  const option = modGroup.options[idx];

  if (checked) {
    active.selectedModifiers.push(option);
  } else {
    active.selectedModifiers = active.selectedModifiers.filter(m => m.name !== option.name);
  }

  // Recalculate price in modal button
  let totalPrice = active.product.price;
  active.selectedModifiers.forEach(m => totalPrice += m.price);
  
  document.getElementById('modal-total-price').innerText = `Adicionar por R$ ${totalPrice.toFixed(2)}`;
};

window.addActiveProductToCart = function() {
  const active = state.activeModifiersProduct;
  if (!active) return;

  let finalPrice = active.product.price;
  active.selectedModifiers.forEach(m => finalPrice += m.price);

  const cartItem = {
    uniqueId: Date.now().toString(),
    productId: active.product.id,
    name: active.product.name,
    basePrice: active.product.price,
    modifiers: [...active.selectedModifiers],
    finalPrice: finalPrice,
    quantity: 1
  };

  state.cart.push(cartItem);
  showToast(`${active.product.name} adicionado ao carrinho!`, 'success');
  
  closeModifiersModal();
  updateCartUI();
  
  // Auto open cart drawer
  openCartDrawer();
};

// ==========================================
// CART DRAWER (SIDEBAR)
// ==========================================
window.openCartDrawer = function() {
  document.getElementById('cart-drawer').classList.add('active');
  document.getElementById('cart-drawer-backdrop').classList.add('active');
};

window.closeCartDrawer = function() {
  document.getElementById('cart-drawer').classList.remove('active');
  document.getElementById('cart-drawer-backdrop').classList.remove('active');
};

window.updateQty = function(uniqueId, change) {
  const item = state.cart.find(i => i.uniqueId === uniqueId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    state.cart = state.cart.filter(i => i.uniqueId !== uniqueId);
    showToast(`${item.name} removido do carrinho.`, 'neutral');
  }

  updateCartUI();
};

function updateCartUI() {
  const cartList = document.getElementById('cart-items-list');
  const cartCount = document.getElementById('cart-count');
  const cartBadge = document.getElementById('cart-badge-count');
  const subtotalElement = document.getElementById('cart-subtotal');
  const deliveryElement = document.getElementById('cart-delivery');
  const discountElement = document.getElementById('cart-discount');
  const totalElement = document.getElementById('cart-total');
  
  // Update store indicators
  const storeIndicator = document.getElementById('cart-store-name-indicator');
  if (storeIndicator) {
    storeIndicator.innerText = state.selectedStore.name;
  }
  
  cartList.innerHTML = '';
  
  let subtotal = 0;
  let totalQty = 0;

  if (state.cart.length === 0) {
    cartList.innerHTML = `
      <div style="text-align: center; padding: var(--space-xl) 0; color: var(--color-text-muted);">
        <p style="font-size: var(--font-size-md); font-weight: 500;">Seu carrinho está vazio</p>
        <p style="font-size: var(--font-size-xs); margin-top: var(--space-xs);">Escolha opções deliciosas no cardápio!</p>
      </div>
    `;
    cartCount.innerText = '0';
    if (cartBadge) cartBadge.style.display = 'none';
  } else {
    state.cart.forEach(item => {
      subtotal += item.finalPrice * item.quantity;
      totalQty += item.quantity;

      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item';
      
      const modsText = item.modifiers.map(m => m.name).join(', ') || 'Nenhum adicional';

      itemRow.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-details">${modsText}</div>
          <div class="cart-item-price">R$ ${item.finalPrice.toFixed(2)}</div>
        </div>
        <div class="cart-item-actions">
          <button style="color: var(--color-danger); font-size: var(--font-size-xs); cursor:pointer;" onclick="updateQty('${item.uniqueId}', -${item.quantity})">Remover</button>
          <div class="qty-selector mt-sm">
            <button class="qty-btn" onclick="updateQty('${item.uniqueId}', -1)">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQty('${item.uniqueId}', 1)">+</button>
          </div>
        </div>
      `;
      cartList.appendChild(itemRow);
    });

    cartCount.innerText = totalQty;
    if (cartBadge) {
      cartBadge.innerText = totalQty;
      cartBadge.style.display = 'flex';
    }
  }

  // Delivery Fee Calculation
  let deliveryFee = 0;
  if (state.serviceMode === 'delivery' && state.cart.length > 0) {
    deliveryFee = state.address ? 6.90 : 9.90; // Promo fee if address is confirmed
  }

  // Discount Calculation (Fidelização 15% discount if joined)
  let discount = 0;
  if (state.fidelityJoined && state.cart.length > 0) {
    discount = subtotal * 0.15; // 15% discount
  }

  const finalTotal = subtotal + deliveryFee - discount;

  subtotalElement.innerText = `R$ ${subtotal.toFixed(2)}`;
  deliveryElement.innerText = deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2)}`;
  discountElement.innerText = discount === 0 ? 'R$ 0.00' : `- R$ ${discount.toFixed(2)}`;
  
  if (discount > 0) {
    discountElement.style.color = 'var(--color-success)';
  } else {
    discountElement.style.color = 'var(--color-text-main)';
  }

  totalElement.innerText = `R$ ${finalTotal.toFixed(2)}`;
  updateFidelityBanner();
}

// ==========================================
// CUSTOMER REGISTRATION, LOGIN & FIDELITY (LGPD)
// ==========================================
window.openAuthModal = function() {
  document.getElementById('auth-modal').classList.add('active');
};

window.closeAuthModal = function() {
  document.getElementById('auth-modal').classList.remove('active');
};

window.toggleAuthTab = function(tab) {
  const loginTab = document.getElementById('auth-tab-login');
  const registerTab = document.getElementById('auth-tab-register');
  const loginForm = document.getElementById('auth-form-login');
  const registerForm = document.getElementById('auth-form-register');

  if (tab === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  } else {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
  }
};

window.formatPhone = function(input) {
  let val = input.value.replace(/\D/g, '');
  if (val.length > 11) val = val.substring(0, 11);
  
  if (val.length > 6) {
    input.value = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
  } else if (val.length > 2) {
    input.value = `(${val.substring(0, 2)}) ${val.substring(2)}`;
  } else if (val.length > 0) {
    input.value = `(${val}`;
  }
};

window.formatCPF = function(input) {
  let val = input.value.replace(/\D/g, '');
  if (val.length > 11) val = val.substring(0, 11);

  if (val.length > 9) {
    input.value = `${val.substring(0, 3)}.${val.substring(3, 6)}.${val.substring(6, 9)}-${val.substring(9)}`;
  } else if (val.length > 6) {
    input.value = `${val.substring(0, 3)}.${val.substring(3, 6)}.${val.substring(6)}`;
  } else if (val.length > 3) {
    input.value = `${val.substring(0, 3)}.${val.substring(3)}`;
  } else {
    input.value = val;
  }
};

window.handleLogin = function() {
  const email = normalizeEmail(document.getElementById('login-email').value);
  const pass = document.getElementById('login-password').value;

  if (!email || !pass) {
    showToast('Por favor, preencha todos os campos.', 'danger');
    return;
  }

  const account = CUSTOMER_ACCOUNTS.find(user => user.email === email && user.password === pass);

  if (!account) {
    showToast('E-mail ou senha incorretos. Tente novamente.', 'danger');
    return;
  }

  state.user = {
    name: account.name,
    email: account.email,
    phone: account.phone,
    cpf: account.cpf
  };
  state.fidelityJoined = true;
  state.fidelityConsent = true;

  showToast(`Bem-vindo(a) de volta, ${state.user.name}!`, 'success');
  closeAuthModal();
  updateAuthUI();
  updateCartUI();
};

window.handleRegister = function() {
  const name = document.getElementById('reg-name').value.trim();
  const email = normalizeEmail(document.getElementById('reg-email').value);
  const phone = document.getElementById('reg-phone').value;
  const cpf = document.getElementById('reg-cpf').value;
  const pass = document.getElementById('reg-password').value;
  const lgpd = document.getElementById('reg-lgpd-consent').checked;

  if (!name || !email || !phone || !cpf || !pass) {
    showToast('Por favor, preencha todos os campos do cadastro.', 'danger');
    return;
  }

  if (!isValidEmail(email)) {
    showToast('Informe um e-mail valido para concluir o cadastro.', 'danger');
    return;
  }

  if (pass.length < MIN_PASSWORD_LENGTH) {
    showToast(`A senha precisa ter no minimo ${MIN_PASSWORD_LENGTH} caracteres.`, 'danger');
    return;
  }

  if (CUSTOMER_ACCOUNTS.some(user => user.email === email)) {
    showToast('Este e-mail ja esta cadastrado. Entre na sua conta.', 'danger');
    return;
  }

  if (!lgpd) {
    showToast('É necessário aceitar os termos de uso de dados (LGPD).', 'danger');
    return;
  }

  CUSTOMER_ACCOUNTS.push({
    name: name,
    email: email,
    password: pass,
    phone: phone,
    cpf: cpf
  });

  state.user = {
    name: name,
    email: email,
    phone: phone,
    cpf: cpf
  };
  state.fidelityJoined = true;
  state.fidelityConsent = true;

  showToast(`Cadastro realizado com sucesso! Bem-vindo(a), ${name}.`, 'success');
  closeAuthModal();
  updateAuthUI();
  updateCartUI();
};

window.handleLogout = function() {
  state.user = null;
  state.fidelityJoined = false;
  state.fidelityConsent = false;
  showToast('Você saiu da sua conta.', 'neutral');
  updateAuthUI();
  updateCartUI();
};

function updateAuthUI() {
  const authBtn = document.getElementById('auth-header-btn');
  if (state.user) {
    const firstName = state.user.name.split(' ')[0];
    authBtn.innerHTML = `Olá, <strong>${firstName}</strong> | <span style="font-weight:normal; text-decoration:underline; margin-left:5px; cursor:pointer;" onclick="event.stopPropagation(); handleLogout();">Sair</span>`;
    authBtn.onclick = null;
    authBtn.style.cursor = 'default';
  } else {
    authBtn.innerHTML = 'Entrar / Cadastrar';
    authBtn.onclick = openAuthModal;
    authBtn.style.cursor = 'pointer';
  }
}

function updateFidelityBanner() {
  const statusBanner = document.getElementById('fidelity-status-banner');
  if (!statusBanner) return;

  if (state.user) {
    statusBanner.innerHTML = `
      <div style="background-color: var(--color-success-light); border: 1.5px dashed var(--color-success); border-radius: var(--radius-md); padding: var(--space-sm); margin-top: var(--space-md); text-align: center;">
        <p style="font-weight: 700; color: var(--color-success); margin: 0; font-family: var(--font-display);">✓ CLIENTE FIDELIDADE ATIVO</p>
        <p style="font-size: var(--font-size-xs); color: var(--color-text-main); margin: 4px 0 0 0;">
          Olá, ${state.user.name}! CPF: ${state.user.cpf} (LGPD em conformidade).
        </p>
        <span class="badge badge-success mt-sm" style="font-size: 10px;">Desconto Exclusivo Ativo (15%)</span>
      </div>
    `;
  } else {
    statusBanner.innerHTML = `
      <div style="background-color: var(--color-secondary-light); border: 1.5px dashed var(--color-secondary); border-radius: var(--radius-md); padding: var(--space-sm); margin-top: var(--space-md); text-align: center;">
        <h4 style="font-size: var(--font-size-xs); font-family: var(--font-display); color: var(--color-primary-hover); margin-bottom: var(--space-2xs);">
          🎁 Desconto Fidelidade de 15%
        </h4>
        <p style="font-size: 11px; color: var(--color-text-main); margin-bottom: var(--space-sm);">
          Cadastre-se ou acesse sua conta agora para receber 15% de desconto imediato!
        </p>
        <button class="btn btn-accent btn-sm w-full" onclick="openAuthModal()">Entrar / Cadastrar-se</button>
      </div>
    `;
  }
}

// ==========================================
// CHECKOUT & EXTERNAL PAYMENT (DESACOPLADO)
// ==========================================
window.startCheckout = function() {
  if (state.systemDown) {
    showToast('Erro de comunicação com o servidor de checkout. Tente novamente.', 'danger');
    return;
  }

  if (state.cart.length === 0) {
    showToast('Adicione pelo menos um item para fazer o pedido.', 'danger');
    return;
  }

  if (state.serviceMode === 'delivery' && !state.address) {
    showToast('Por favor, informe seu endereço antes de finalizar.', 'danger');
    openCartDrawer(); // Keep drawer open
    return;
  }

  closeCartDrawer();
  
  // Open checkout simulation modal
  const modal = document.getElementById('checkout-modal');
  modal.classList.add('active');

  // Render values
  let subtotal = state.cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
  let deliveryFee = (state.serviceMode === 'delivery') ? (state.address ? 6.90 : 9.90) : 0;
  let discount = state.fidelityJoined ? (subtotal * 0.15) : 0;
  let total = subtotal + deliveryFee - discount;

  document.getElementById('checkout-total-val').innerText = `R$ ${total.toFixed(2)}`;
};

window.closeCheckoutModal = function() {
  document.getElementById('checkout-modal').classList.remove('active');
};

// Simulation of external decoupled gateway API
window.simulatePayment = function(paymentMethod, shouldSucceed) {
  closeCheckoutModal();
  
  // Open status modal
  const statusModal = document.getElementById('order-status-modal');
  statusModal.classList.add('active');

  const statusTitle = document.getElementById('status-step-title');
  const statusMessage = document.getElementById('status-step-desc');
  const timelineSteps = document.querySelectorAll('.status-step');
  
  // Set Timeline to Step 1 (Criado)
  setTimelineStep(0);
  statusTitle.innerText = "Solicitando Pagamento...";
  statusMessage.innerHTML = `
    Enviando cobrança de R$ ${document.getElementById('checkout-total-val').innerText} via <strong>${paymentMethod.toUpperCase()}</strong> ao processador externo de pagamentos...
    <div class="mt-md" style="display:flex; justify-content:center;"><div class="spinner"></div></div>
  `;

  // Desacoplamento: Wait 3 seconds to simulate async gateway notification
  setTimeout(() => {
    if (state.systemDown) {
      // If server drops during transaction
      statusTitle.innerText = "Transação em Processo de Recuperação";
      statusMessage.innerHTML = `
        <p style="color: var(--color-danger); font-weight:600;">ALTA DISPONIBILIDADE: Detetamos perda de conexão durante a transação.</p>
        <p style="font-size: var(--font-size-xs);">O sistema salvará o estado localmente e consultará a webhook de confirmação externa assim que restabelecido. Nenhuma cobrança duplicada será gerada.</p>
        <button class="btn btn-outline btn-sm mt-md w-full" onclick="closeOrderStatusModal()">Fechar e Aguardar Reestabelecimento</button>
      `;
      return;
    }

    if (shouldSucceed) {
      // Payment Successful
      setTimelineStep(1); // Confirmado
      statusTitle.innerText = "Pagamento Confirmado!";
      statusMessage.innerHTML = `
        <div style="background-color: var(--color-success-light); color: var(--color-success); padding: var(--space-sm); border-radius: var(--radius-md); font-weight:600; margin-bottom: var(--space-md);">
          Pagamento processado com sucesso pelo gateway externo.
        </div>
        <p>Seu pedido foi encaminhado para a cozinha da unidade <strong>${state.selectedStore.name}</strong>.</p>
        <p style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: var(--space-sm);">
          Rastreabilidade: Transação ID: TX_${Math.floor(Math.random() * 900000 + 100000)} | Status: APROVADO
        </p>
        <button class="btn btn-primary btn-sm mt-md w-full" onclick="advanceOrderPreparation()">Acompanhar Preparo (Demo)</button>
      `;
      
      // Clear Cart
      state.cart = [];
      updateCartUI();
    } else {
      // Payment Declined
      statusTitle.innerText = "Transação Recusada";
      statusMessage.innerHTML = `
        <div style="background-color: var(--color-danger-light); color: var(--color-danger); padding: var(--space-sm); border-radius: var(--radius-md); font-weight:600; margin-bottom: var(--space-md);">
          O processador externo informou saldo insuficiente ou erro de autenticação.
        </div>
        <p>Não se preocupe, seus itens continuam salvos no carrinho para que você possa tentar novamente.</p>
        <button class="btn btn-primary btn-sm mt-md w-full" onclick="retryCheckout()">Tentar Novamente</button>
      `;
    }
  }, 2500);
};

window.closeOrderStatusModal = function() {
  document.getElementById('order-status-modal').classList.remove('active');
};

function setTimelineStep(index) {
  const steps = document.querySelectorAll('.status-step');
  steps.forEach((step, idx) => {
    step.classList.remove('active', 'completed');
    if (idx < index) {
      step.classList.add('completed');
    } else if (idx === index) {
      step.classList.add('active');
    }
  });
}

window.advanceOrderPreparation = function() {
  const statusTitle = document.getElementById('status-step-title');
  const statusMessage = document.getElementById('status-step-desc');
  
  // Set Timeline to Step 2 (Em Preparo)
  setTimelineStep(2);
  statusTitle.innerText = "Prato no Fogo!";
  statusMessage.innerHTML = `
    <p>A equipe de cozinheiros já está preparando seu cuscuz / tapioca quentinho com ingredientes locais selecionados.</p>
    <div style="margin: var(--space-md) 0; text-align: center;">
      <span class="badge badge-secondary" style="animation: pulse 1.5s infinite;">Preparando com carinho...</span>
    </div>
    <button class="btn btn-primary btn-sm w-full" onclick="finishOrderPreparation()">Concluir Preparo (Demo)</button>
  `;
};

window.finishOrderPreparation = function() {
  const statusTitle = document.getElementById('status-step-title');
  const statusMessage = document.getElementById('status-step-desc');
  
  // Set Timeline to Step 3 (Pronto/Rota)
  setTimelineStep(3);
  
  if (state.serviceMode === 'delivery') {
    statusTitle.innerText = "Saiu para Entrega!";
    statusMessage.innerHTML = `
      <p>O entregador já coletou sua sacola e está a caminho de: </p>
      <div style="background-color: var(--color-bg-grey); padding: var(--space-xs); border-radius: var(--radius-sm); font-size:var(--font-size-xs);">
        ${state.address}
      </div>
      <p class="mt-sm">Tempo estimado: <strong>12 a 20 minutos</strong>.</p>
      <button class="btn btn-outline btn-sm mt-md w-full" onclick="closeOrderStatusModal()">Concluir Acompanhamento</button>
    `;
  } else {
    statusTitle.innerText = "Pronto para Retirada!";
    statusMessage.innerHTML = `
      <p>Seu pedido está no balcão da unidade <strong>${state.selectedStore.name}</strong>, quentinho e embalado.</p>
      <p>Dirija-se ao local e informe o código do pedido: <strong>#RAIZ-${Math.floor(Math.random() * 9000 + 1000)}</strong>.</p>
      <button class="btn btn-outline btn-sm mt-md w-full" onclick="closeOrderStatusModal()">Concluir Acompanhamento</button>
    `;
  }
};

window.retryCheckout = function() {
  closeOrderStatusModal();
  openCartDrawer();
};



// ==========================================
// UTILITIES (TOASTS)
// ==========================================
function showToast(message, type = 'primary') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.style.cssText = `
    padding: var(--space-sm) var(--space-md);
    background-color: var(--color-bg-white);
    border-left: 5px solid var(--color-primary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    font-size: var(--font-size-sm);
    font-weight: 500;
    margin-bottom: var(--space-xs);
    opacity: 0;
    transform: translateY(20px);
    transition: all var(--transition-md);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    z-index: 10000;
  `;

  if (type === 'success') toast.style.borderLeftColor = 'var(--color-success)';
  if (type === 'danger') toast.style.borderLeftColor = 'var(--color-danger)';
  if (type === 'primary') toast.style.borderLeftColor = 'var(--color-primary)';
  if (type === 'neutral') toast.style.borderLeftColor = 'var(--color-text-muted)';

  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'danger' ? '⚠' : 'ℹ'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 50);

  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Add simple CSS animations inside Javascript for quick prototyping
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(1); opacity: 0.9; }
  }
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s infinite linear;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
