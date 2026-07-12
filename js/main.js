// Flora — main.js
// Author: Serhii Babiian

const API_BASE = 'http://localhost:3001';
const ITEMS_PER_PAGE = 4;

const state = {
  page: 1,
  category: 'all',
  totalItems: 0,
  isLoading: false,
};

const bouquetsList = document.querySelector('.bouquets__list');
const showMoreBtn = document.querySelector('.bouquets__show-more');
const filterBtns = document.querySelectorAll('[data-filter]');
const bestsellersSlider = document.querySelector('.bestsellers__list');

// ============================================
// API — json-server v1 uses _page/_per_page
// ============================================
async function fetchBouquets({ page = 1, category = 'all' } = {}) {
  try {
    let url = `${API_BASE}/bouquets?_page=${page}&_per_page=${ITEMS_PER_PAGE}`;
    if (category !== 'all') url += `&category=${category}`;

    const response = await axios.get(url);
    console.log('Bouquets raw response:', response.data);

    const raw = response.data;

    // json-server v1: { first, prev, next, last, pages, items: [...] }
    if (raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray(raw.items)) {
      console.log('Format: json-server v1 — items array, pages:', raw.pages);
      const totalPages = raw.pages || 1;
      return { data: raw.items, total: raw.pages * ITEMS_PER_PAGE, pages: totalPages };
    }

    // json-server v1 alt: { data: [...], items: N, pages: N }
    if (raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray(raw.data)) {
      console.log('Format: json-server v1 (wrapped data)');
      return { data: raw.data, total: raw.items || 0, pages: raw.pages || 1 };
    }

    // json-server v0: plain array
    if (Array.isArray(raw)) {
      console.log('Format: json-server v0 (plain array)');
      const total = parseInt(response.headers['x-total-count'] || raw.length, 10);
      return { data: raw, total, pages: Math.ceil(total / ITEMS_PER_PAGE) };
    }

    console.warn('Unknown response format:', raw);
    return { data: [], total: 0, pages: 0 };

  } catch (error) {
    console.error('Fetch bouquets error:', error);
    if (bouquetsList) {
      bouquetsList.innerHTML = '<li class="bouquets__error"><p>Failed to load. Check that json-server is running on port 3001.</p></li>';
    }
    return { data: [], total: 0, pages: 0 };
  }
}

async function fetchBestsellers() {
  try {
    const response = await axios.get(`${API_BASE}/bestsellers`);
    console.log('Bestsellers response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Fetch bestsellers error:', error);
    return [];
  }
}

// ============================================
// TEMPLATES
// ============================================
function createBouquetCard(b) {
  return `<li class="bouquets__item">
    <button class="bouquets__card-btn" type="button"
      aria-label="View details for ${b.name}"
      data-name="${b.name}" data-price="${b.price}"
      data-desc="${b.description}"
      data-img="${b.image}" data-img2x="${b.image2x || b.image}">
      <div class="bouquets__thumb">
        <img src="${b.image}"
          srcset="${b.image} 1x, ${b.image2x || b.image} 2x"
          alt="${b.name} bouquet" width="280" height="220" loading="lazy"/>
      </div>
      <h3 class="bouquets__name">${b.name}</h3>
      <p class="bouquets__desc">${b.description}</p>
      <p class="bouquets__price">$${b.price}</p>
    </button>
  </li>`;
}

function createBestsellerCard(b) {
  return `<li class="bestsellers__item">
    <button class="bestsellers__card-btn" type="button"
      aria-label="View details for ${b.name}"
      data-name="${b.name}" data-price="${b.price}"
      data-desc="${b.description}"
      data-img="${b.image}" data-img2x="${b.image2x || b.image}">
      <div class="bestsellers__thumb">
        <img src="${b.image}"
          srcset="${b.image} 1x, ${b.image2x || b.image} 2x"
          alt="${b.name} bouquet" width="430" height="310" loading="lazy"/>
      </div>
      <h3 class="bestsellers__name">${b.name}</h3>
      <p class="bestsellers__desc">${b.description}</p>
      <p class="bestsellers__price">$${b.price}</p>
    </button>
  </li>`;
}

// ============================================
// RENDER
// ============================================
function renderBouquets(bouquets, append = false) {
  if (!bouquetsList) return;
  if (!append) bouquetsList.innerHTML = '';

  if (!bouquets.length && !append) {
    bouquetsList.innerHTML = '<li class="bouquets__empty"><p>No bouquets found.</p></li>';
    return;
  }

  bouquetsList.insertAdjacentHTML('beforeend', bouquets.map(createBouquetCard).join(''));
  bindCardButtons();
}

function renderBestsellers(items) {
  if (!bestsellersSlider || !items.length) return;
  bestsellersSlider.innerHTML = items.map(createBestsellerCard).join('');
  bindBestsellerButtons();
}

function updateShowMoreBtn(total, pages) {
  if (!showMoreBtn) return;
  const hide = pages ? state.page >= pages : state.page * ITEMS_PER_PAGE >= total;
  showMoreBtn.style.display = hide ? 'none' : 'block';
}

// ============================================
// LOAD
// ============================================
async function loadBouquets(append = false) {
  if (state.isLoading) return;
  state.isLoading = true;

  if (!append && bouquetsList) {
    bouquetsList.innerHTML = '<li class="bouquets__loading"><p>Loading...</p></li>';
  }

  const { data, total, pages } = await fetchBouquets({
    page: state.page,
    category: state.category,
  });

  state.totalItems = total;
  renderBouquets(data, append);
  updateShowMoreBtn(total, pages);
  state.isLoading = false;
}

// ============================================
// SHOW MORE
// ============================================
if (showMoreBtn) {
  showMoreBtn.addEventListener('click', async () => {
    state.page += 1;
    await loadBouquets(true);
  });
}

// ============================================
// FILTERS
// ============================================
filterBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    const category = btn.dataset.filter;
    if (category === state.category) return;
    state.category = category;
    state.page = 1;
    filterBtns.forEach(b => b.classList.remove('bouquets__filter-btn--active'));
    btn.classList.add('bouquets__filter-btn--active');
    await loadBouquets(false);
  });
});

// ============================================
// MODALS
// ============================================
const modalProduct = document.querySelector('#modal-product');
const modalOrder = document.querySelector('#modal-order');

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeAllModals() {
  [modalProduct, modalOrder].forEach(m => {
    if (m) m.classList.remove('is-open');
  });
  document.body.style.overflow = '';
}

document.querySelectorAll('.js-modal-close').forEach(el => {
  el.addEventListener('click', closeAllModals);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAllModals();
});

document.querySelectorAll('[data-modal-open="order"]').forEach(btn => {
  btn.addEventListener('click', () => {
    closeAllModals();
    openModal(modalOrder);
  });
});

function bindBestsellerButtons() {
  document.querySelectorAll('.bestsellers__card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!modalProduct) return;
      const modalImg = modalProduct.querySelector('.product-modal__img');
      const modalTitle = modalProduct.querySelector('.product-modal__title');
      const modalPrice = modalProduct.querySelector('.product-modal__price');
      const modalDesc = modalProduct.querySelector('.product-modal__desc');

      if (modalImg) {
        modalImg.src = btn.dataset.img;
        modalImg.srcset = `${btn.dataset.img} 1x, ${btn.dataset.img2x} 2x`;
        modalImg.alt = btn.dataset.name + ' bouquet';
      }
      if (modalTitle) modalTitle.textContent = btn.dataset.name;
      if (modalPrice) modalPrice.textContent = `$${btn.dataset.price}`;
      if (modalDesc) modalDesc.textContent = btn.dataset.desc;

      openModal(modalProduct);
    });
  });
}

function bindCardButtons() {
  document.querySelectorAll('.bouquets__card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!modalProduct) return;
      const modalImg = modalProduct.querySelector('.product-modal__img');
      const modalTitle = modalProduct.querySelector('.product-modal__title');
      const modalPrice = modalProduct.querySelector('.product-modal__price');
      const modalDesc = modalProduct.querySelector('.product-modal__desc');

      if (modalImg) {
        modalImg.src = btn.dataset.img;
        modalImg.srcset = `${btn.dataset.img} 1x, ${btn.dataset.img2x} 2x`;
        modalImg.alt = btn.dataset.name + ' bouquet';
      }
      if (modalTitle) modalTitle.textContent = btn.dataset.name;
      if (modalPrice) modalPrice.textContent = `$${btn.dataset.price}`;
      if (modalDesc) modalDesc.textContent = btn.dataset.desc;

      openModal(modalProduct);
    });
  });
}

// ============================================
// MOBILE MENU
// ============================================
const burgerBtn = document.querySelector('.burger-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const menuCloseBtn = document.querySelector('.mobile-menu__close');

if (burgerBtn && mobileMenu) {
  burgerBtn.addEventListener('click', () => {
    mobileMenu.classList.add('is-open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  });
}

if (menuCloseBtn) {
  menuCloseBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
    if (burgerBtn) burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
}

document.querySelectorAll('.mobile-menu__link, .mobile-menu__cta').forEach(link => {
  link.addEventListener('click', () => {
    if (mobileMenu) mobileMenu.classList.remove('is-open');
    if (burgerBtn) burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// ============================================
// ORDER FORM
// ============================================
const orderForm = document.querySelector('.order-modal__form');
if (orderForm) {
  orderForm.addEventListener('submit', async e => {
    e.preventDefault();

    const licenseChecked = orderForm.querySelector('#order-license')?.checked;
    if (!licenseChecked) {
      alert('Please agree to the Privacy Policy.');
      return;
    }

    try {
      await axios.post(`${API_BASE}/orders`, {
        name: orderForm.querySelector('#order-name')?.value,
        phone: orderForm.querySelector('#order-phone')?.value,
        address: orderForm.querySelector('#order-address')?.value,
        message: orderForm.querySelector('#order-message')?.value,
      });
      closeAllModals();
      orderForm.reset();
      alert('Order placed successfully!');
    } catch (err) {
      console.error('Order error:', err);
      alert('Something went wrong. Please try again.');
    }
  });
}

// ============================================
// INIT
// ============================================
async function init() {
  console.log('Flora app initializing...');
  const bestsellers = await fetchBestsellers();
  renderBestsellers(bestsellers);
  await loadBouquets(false);
  console.log('Flora app ready');
}

init();