// Flora — mobile-menu.js
// Author: Serhii Babiian
// Toggle is-open class for mobile menu and modals

const burgerBtn = document.querySelector('.burger-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const closeBtn = document.querySelector('.mobile-menu__close');
const menuLinks = document.querySelectorAll('.mobile-menu__link');
const menuCta = document.querySelector('.mobile-menu__cta');

function openMenu() {
  mobileMenu.classList.add('is-open');
  burgerBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  mobileMenu.classList.remove('is-open');
  burgerBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

burgerBtn.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);

menuLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

if (menuCta) {
  menuCta.addEventListener('click', closeMenu);
}

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeMenu();
    closeAllModals();
  }
});

// ---- MODALS ----
const modalProduct = document.querySelector('#modal-product');
const modalOrder = document.querySelector('#modal-order');

function openModal(modal) {
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

function closeAllModals() {
  [modalProduct, modalOrder].forEach(m => {
    if (m) m.classList.remove('is-open');
  });
  document.body.style.overflow = '';
}

// Open product modal on bouquet card click
document.querySelectorAll('[data-modal="product"]').forEach(btn => {
  btn.addEventListener('click', () => openModal(modalProduct));
});

// Open order modal from product modal "Buy now"
document.querySelectorAll('[data-modal-open="order"]').forEach(btn => {
  btn.addEventListener('click', () => {
    closeModal(modalProduct);
    openModal(modalOrder);
  });
});

// Close modals via backdrop or × button
document.querySelectorAll('.js-modal-close').forEach(el => {
  el.addEventListener('click', closeAllModals);
});
