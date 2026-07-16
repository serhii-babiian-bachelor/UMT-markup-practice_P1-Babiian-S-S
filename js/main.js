// v5 - cache bust
// Flora — main.js
// Author: Serhii Babiian

const API_BASE = 'https://flora-backend-g6bx.onrender.com/api';
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

// All bouquets cache
let allBouquetsCache = null;

async function fetchBouquets({ page = 1, category = 'all' } = {}) {
  try {
    // Fetch all once and cache
    if (!allBouquetsCache) {
      const response = await axios.get(`${API_BASE}/bouquets`);
      allBouquetsCache = Array.isArray(response.data) ? response.data : [];
    }

    let filtered = allBouquetsCache;
    if (category !== 'all') {
      filtered = allBouquetsCache.filter(b => b.category === category);
    }

    const total = filtered.length;
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const data = filtered.slice(offset, offset + ITEMS_PER_PAGE);

    return {
      data,
      total,
      pages: Math.ceil(total / ITEMS_PER_PAGE),
    };
  } catch (error) {
    console.error('Fetch bouquets error:', error);
    if (bouquetsList) {
      bouquetsList.innerHTML = '<li class="bouquets__error"><p>Failed to load bouquets.</p></li>';
    }
    return { data: [], total: 0, pages: 0 };
  }
}

async function fetchBestsellers() {
  try {
    const response = await axios.get(`${API_BASE}/bestsellers`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Fetch bestsellers error:', error);
    return [];
  }
}

function createBouquetCard(b) {
  const img = b.photoURL || '';
  const name = b.title || '';
  const desc = b.description || '';
  const price = b.price || 0;

  return `<li class="bouquets__item">
    <button class="bouquets__card-btn" type="button"
      aria-label="View details for ${name}"
      data-name="${name}" data-price="${price}"
      data-desc="${desc}"
      data-img="${img}" data-img2x="${img}">
      <div class="bouquets__thumb">
        <img src="${img}" srcset="${img} 1x, ${img} 2x"
          alt="${name} bouquet" width="280" height="220" loading="lazy"/>
      </div>
      <h3 class="bouquets__name">${name}</h3>
      <p class="bouquets__desc">${desc}</p>
      <p class="bouquets__price">$${price}</p>
    </button>
  </li>`;
}

function createBestsellerCard(b) {
  const img = b.photoURL || '';
  const name = b.title || '';
  const desc = b.description || '';
  const price = b.price || 0;

  return `<li class="bestsellers__item">
    <button class="bestsellers__card-btn" type="button"
      aria-label="View details for ${name}"
      data-name="${name}" data-price="${price}"
      data-desc="${desc}"
      data-img="${img}" data-img2x="${img}">
      <div class="bestsellers__thumb">
        <img src="${img}" srcset="${img} 1x, ${img} 2x"
          alt="${name} bouquet" width="430" height="310" loading="lazy"/>
      </div>
      <h3 class="bestsellers__name">${name}</h3>
      <p class="bestsellers__desc">${desc}</p>
      <p class="bestsellers__price">$${price}</p>
    </button>
  </li>`;
}

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
  showMoreBtn.style.display = state.page >= pages ? 'none' : 'block';
}

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

if (showMoreBtn) {
  showMoreBtn.addEventListener('click', async () => {
    state.page += 1;
    await loadBouquets(true);
  });
}

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

function openProductModal(btn) {
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
}

function bindBestsellerButtons() {
  document.querySelectorAll('.bestsellers__card-btn').forEach(btn => {
    btn.addEventListener('click', () => openProductModal(btn));
  });
}

function bindCardButtons() {
  document.querySelectorAll('.bouquets__card-btn').forEach(btn => {
    btn.addEventListener('click', () => openProductModal(btn));
  });
}

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
// FEEDBACK SLIDER — mobile only (< 768px)
// ============================================
const feedbackList = document.querySelector('.feedback__list');
const feedbackItems = feedbackList ? Array.from(feedbackList.querySelectorAll('.feedback__item')) : [];
const feedbackPrevBtn = document.querySelector('.feedback__arrows .slider-arrow:first-child');
const feedbackNextBtn = document.querySelector('.feedback__arrows .slider-arrow:last-child');
let feedbackIndex = 0;

function getVisibleFeedbackCount() {
  if (window.innerWidth >= 1440) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
}

function updateFeedbackDisplay() {
  const visible = getVisibleFeedbackCount();
  const total = feedbackItems.length;
  feedbackItems.forEach((item, i) => {
    const pos = (i - feedbackIndex + total) % total;
    item.style.display = pos < visible ? 'block' : 'none';
  });
}

if (feedbackItems.length > 0) {
  updateFeedbackDisplay();
  window.addEventListener('resize', updateFeedbackDisplay);

  if (feedbackPrevBtn) {
    feedbackPrevBtn.addEventListener('click', () => {
      feedbackIndex = (feedbackIndex - 1 + feedbackItems.length) % feedbackItems.length;
      updateFeedbackDisplay();
    });
  }

  if (feedbackNextBtn) {
    feedbackNextBtn.addEventListener('click', () => {
      feedbackIndex = (feedbackIndex + 1) % feedbackItems.length;
      updateFeedbackDisplay();
    });
  }
}

// ============================================
// BESTSELLERS SLIDER — mobile: 1, tablet: 2, desktop: 3
// ============================================
let bestsellersIndex = 0;
const bestsellersPrevBtn = document.querySelector('.bestsellers__arrows .slider-arrow:first-child');
const bestsellersNextBtn = document.querySelector('.bestsellers__arrows .slider-arrow:last-child');
const dotBtns = document.querySelectorAll('.bestsellers__dot');

function getVisibleCount() {
  if (window.innerWidth >= 1440) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
}

function updateBestsellersDisplay() {
  const items = bestsellersSlider ? Array.from(bestsellersSlider.querySelectorAll('.bestsellers__item')) : [];
  if (!items.length) return;

  const visibleCount = getVisibleCount();
  const total = items.length;

  // Circular: show visibleCount items starting from bestsellersIndex
  items.forEach((item, i) => {
    const pos = (i - bestsellersIndex + total) % total;
    item.style.display = pos < visibleCount ? 'block' : 'none';
  });

  dotBtns.forEach((dot, i) => {
    dot.classList.toggle('bestsellers__dot--active', i === bestsellersIndex);
  });
}

function initBestsellersSlider() {
  const items = bestsellersSlider ? Array.from(bestsellersSlider.querySelectorAll('.bestsellers__item')) : [];
  if (!items.length) return;

  updateBestsellersDisplay();
  window.addEventListener('resize', updateBestsellersDisplay);

  if (bestsellersPrevBtn) {
    bestsellersPrevBtn.addEventListener('click', () => {
      const total = bestsellersSlider.querySelectorAll('.bestsellers__item').length;
      bestsellersIndex = (bestsellersIndex - 1 + total) % total;
      updateBestsellersDisplay();
    });
  }

  if (bestsellersNextBtn) {
    bestsellersNextBtn.addEventListener('click', () => {
      const total = bestsellersSlider.querySelectorAll('.bestsellers__item').length;
      bestsellersIndex = (bestsellersIndex + 1) % total;
      updateBestsellersDisplay();
    });
  }

  dotBtns.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      bestsellersIndex = i;
      updateBestsellersDisplay();
    });
  });
}

async function init() {
  const bestsellers = await fetchBestsellers();
  renderBestsellers(bestsellers);
  initBestsellersSlider();
  await loadBouquets(false);
}

init();