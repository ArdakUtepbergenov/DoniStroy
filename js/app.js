/* ============================================================
   DONI STROI — Main App (ES Module)
   Firebase Firestore + Unsplash images
   ============================================================ */

// ── Firebase SDK ──────────────────────────────────────────────
import { initializeApp }                        from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, getDocs,
         addDoc, updateDoc, deleteDoc,
         doc, setDoc, onSnapshot,
         query, orderBy }                       from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── Firebase Config ───────────────────────────────────────────
const firebaseConfig = {
  apiKey:            'AIzaSyAM5KisnFDTRtDmpKb3AGjZ4KVjzQHWL3o',
  authDomain:        'donistroy-628c7.firebaseapp.com',
  projectId:         'donistroy-628c7',
  storageBucket:     'donistroy-628c7.firebasestorage.app',
  messagingSenderId: '430428652622',
  appId:             '1:430428652622:web:2fca11666abd3cf0beaf1f',
  measurementId:     'G-EF5VKEC2CN'
};

const fbApp = initializeApp(firebaseConfig);
const db    = getFirestore(fbApp);
const COL   = 'products'; // Firestore collection name

// ── Unsplash image URLs (тематические фото фасадов) ───────────
const UNSPLASH = {
  hero:    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80&fit=crop',
  about:   'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80&fit=crop',
  thermo1: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80&fit=crop',
  thermo2: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80&fit=crop',
  poly1:   'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80&fit=crop',
  poly2:   'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80&fit=crop',
  trav1:   'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&fit=crop',
  trav2:   'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80&fit=crop',
  facade1: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80&fit=crop',
  facade2: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&fit=crop',
  facade3: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80&fit=crop',
};

// Default fallback image per category
const CAT_IMG = {
  thermo:    UNSPLASH.thermo1,
  poly:      UNSPLASH.poly1,
  travertine:UNSPLASH.trav1,
};

// ── Default seed products (seeded once to Firestore if empty) ──
const SEED_PRODUCTS = [
  {
    category:'thermo', badge:'Хит продаж', order:1,
    name:'Термопанель ТП-200 «Лофт»',
    desc:'Современная фасадная термопанель с текстурой лофт-кирпича. Отличная теплоизоляция и эстетика.',
    fullDesc:'Термопанель серии «Лофт» — идеальное решение для тех, кто ценит стиль и функциональность. Пенополистирол высокой плотности обеспечивает отличную теплоизоляцию, а рельефная клинкерная плитка придаёт фасаду вид натурального кирпича.',
    price:'2 800', unit:'м²', imageUrl: UNSPLASH.thermo1,
    specs:{'Толщина утеплителя':'100 мм','Размер панели':'1000×500 мм','Вес':'12 кг/м²','Крепёж':'Скрытый','Гарантия':'15 лет'}
  },
  {
    category:'thermo', badge:'Новинка', order:2,
    name:'Термопанель ТП-300 «Скала»',
    desc:'Элегантная текстура натурального камня. Подходит для частных домов и коммерческих зданий.',
    fullDesc:'Термопанель «Скала» имитирует грубую природную текстуру камня, создавая монументальный и благородный облик здания. Увеличенная толщина пенополистирола (150 мм) делает её лидером по теплосбережению.',
    price:'3 400', unit:'м²', imageUrl: UNSPLASH.thermo2,
    specs:{'Толщина утеплителя':'150 мм','Размер панели':'1200×600 мм','Вес':'14 кг/м²','Крепёж':'Скрытый','Гарантия':'20 лет'}
  },
  {
    category:'poly', badge:'', order:3,
    name:'Полифасад ПФ-100 «Классик»',
    desc:'Надёжное и доступное решение для утепления и отделки фасада. Широкий выбор цветов.',
    fullDesc:'Полифасад серии «Классик» — проверенное временем решение для облицовки фасадов любых зданий. Лёгкий вес панелей существенно снижает нагрузку на несущие конструкции.',
    price:'1 950', unit:'м²', imageUrl: UNSPLASH.poly1,
    specs:{'Материал':'Полипропилен','Толщина':'20 мм','Размер панели':'1200×300 мм','Вес':'4.5 кг/м²','Гарантия':'10 лет'}
  },
  {
    category:'poly', badge:'Популярный', order:4,
    name:'Полифасад ПФ-200 «Дерево»',
    desc:'Имитация натурального дерева без ухода за деревом. Устойчив к ультрафиолету.',
    fullDesc:'Полифасад «Дерево» воспроизводит тонкую структуру древесных волокон с высокой точностью. Устойчив к влаге, вредителям и не требует покраски.',
    price:'2 200', unit:'м²', imageUrl: UNSPLASH.poly2,
    specs:{'Материал':'Полипропилен','Толщина':'25 мм','Размер панели':'1500×300 мм','Вес':'5.2 кг/м²','Гарантия':'12 лет'}
  },
  {
    category:'travertine', badge:'Премиум', order:5,
    name:'Травертин натуральный «Кремовый»',
    desc:'Натуральный природный камень. Придаёт фасаду роскошный и изысканный вид.',
    fullDesc:'Натуральный травертин «Кремовый» — роскошный материал с многовековой историей применения в архитектуре. Каждая плита уникальна по рисунку и текстуре.',
    price:'4 800', unit:'м²', imageUrl: UNSPLASH.trav1,
    specs:{'Материал':'Натуральный камень','Толщина':'30 мм','Размер плит':'от 300×300 мм','Вес':'22 кг/м²','Гарантия':'50 лет'}
  },
  {
    category:'travertine', badge:'', order:6,
    name:'Травертин «Серебряный»',
    desc:'Серебристо-серый оттенок для современных и минималистичных фасадов.',
    fullDesc:'Травертин «Серебряный» — выбор для современной архитектуры. Холодный серебристо-серый оттенок идеально сочетается со стеклом и тёмным деревом.',
    price:'5 200', unit:'м²', imageUrl: UNSPLASH.trav2,
    specs:{'Материал':'Натуральный камень','Толщина':'25 мм','Размер плит':'от 400×400 мм','Вес':'20 кг/м²','Гарантия':'50 лет'}
  }
];

// ── State ─────────────────────────────────────────────────────
const ADMIN_CREDENTIALS = { login: 'admin', password: 'donistroi2024' };

const State = {
  products: [],
  isAdmin: false,
  currentPage: 'home',
  currentProduct: null,
  currentCategory: 'all',
  loading: true,

  filtered() {
    if (this.currentCategory === 'all') return this.products;
    return this.products.filter(p => p.category === this.currentCategory);
  }
};

// ── Firebase CRUD ─────────────────────────────────────────────
const DB = {
  async loadProducts() {
    const snap = await getDocs(query(collection(db, COL), orderBy('order', 'asc')));
    if (snap.empty) {
      // Seed default products on first run
      await this.seedDefaults();
      return this.loadProducts();
    }
    State.products = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
  },

  async seedDefaults() {
    for (const p of SEED_PRODUCTS) {
      await addDoc(collection(db, COL), p);
    }
  },

  async addProduct(data) {
    data.order = Date.now();
    const ref = await addDoc(collection(db, COL), data);
    await this.loadProducts();
    return ref.id;
  },

  async updateProduct(firestoreId, data) {
    await updateDoc(doc(db, COL, firestoreId), data);
    await this.loadProducts();
  },

  async deleteProduct(firestoreId) {
    await deleteDoc(doc(db, COL, firestoreId));
    await this.loadProducts();
  }
};

// ── Category labels ───────────────────────────────────────────
const CAT = { all:'Все', thermo:'Термопанели', poly:'Полифасад', travertine:'Травертин' };

// ── Icons ─────────────────────────────────────────────────────
const Icons = {
  arrow:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>`,
  phone:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.07 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013 1.22h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 8.9a16 16 0 006 6l1.06-1.06a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>`,
  map:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  mail:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  plus:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  edit:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  x:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  layer:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12,2 2,7 12,12 22,7 12,2"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/></svg>`,
  cube:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  zap:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>`,
  users:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  ruler:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 21.9L21.9 2M15.3 15.3l2.4-2.4M12 12l2.4-2.4M8.7 8.7l2.4-2.4"/></svg>`,
  image:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>`,
  grid:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  check:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>`,
};

// ── Router ────────────────────────────────────────────────────
const Router = {
  navigate(hash) { location.hash = hash; },
  handle(hash) {
    const [page, param] = hash.replace('#', '').split('/');
    State.currentPage   = page || 'home';
    State.currentProduct = param ? param : null; // firestoreId string
    App.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  init() {
    this.handle(location.hash || '#home');
    window.addEventListener('hashchange', () => this.handle(location.hash));
  }
};

// ── Image helper ──────────────────────────────────────────────
function productImg(p, style = '') {
  const src = p.imageUrl || CAT_IMG[p.category] || UNSPLASH.facade1;
  return `<img src="${src}" alt="${p.name}" style="${style}" loading="lazy" onerror="this.src='${CAT_IMG[p.category] || UNSPLASH.facade1}'">`;
}

// ── Components ────────────────────────────────────────────────
const Header = () => `
<header id="header">
  <div class="container">
    <div class="header-inner">
      <a href="#home" class="logo">
        <img src="images/logo.jpg" alt="DoniStroi" class="logo-img">
        <div class="logo-tagline">Фасадные материалы · Атырау</div>
      </a>
      <nav class="nav-links">
        <a href="#home"     class="${State.currentPage==='home'?'active':''}">Главная</a>
        <a href="#about"    class="${State.currentPage==='about'?'active':''}">О компании</a>
        <a href="#services" class="${State.currentPage==='services'?'active':''}">Услуги</a>
        <a href="#catalog"  class="${State.currentPage==='catalog'?'active':''}">Каталог</a>
        <a href="#contacts" class="${State.currentPage==='contacts'?'active':''}">Контакты</a>
        ${State.isAdmin ? `<a href="#admin" class="${State.currentPage==='admin'?'active':''}">Админ</a>` : ''}
      </nav>
      <div class="nav-cta">
        <a href="tel:+77751731067" class="nav-phone">+7 775 173-10-67</a>
        <button class="btn btn-primary btn-sm" onclick="openModal()">Заявка</button>
      </div>
      <!-- Mobile: show phone icon instead of hamburger -->
      <a href="tel:+77751731067" class="mobile-header-call" aria-label="Позвонить">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="20" height="20"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.07 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013 1.22h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 8.9a16 16 0 006 6l1.06-1.06a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
      </a>
      <button class="hamburger" id="hamburger" onclick="toggleMobileNav()" style="display:none">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>`;

const BottomNav = () => `
<nav class="bottom-nav">
  <a href="#home" class="bnav-item ${State.currentPage==='home'?'active':''}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
    Главная
  </a>
  <a href="#catalog" class="bnav-item ${State.currentPage==='catalog'||State.currentPage==='product'?'active':''}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
    Каталог
  </a>
  <a class="bnav-item bnav-cta" onclick="openModal()" style="cursor:pointer" href="javascript:void(0)">
    <div class="bnav-cta-inner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </div>
  </a>
  <a href="#services" class="bnav-item ${State.currentPage==='services'?'active':''}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12,2 2,7 12,12 22,7 12,2"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/></svg>
    Услуги
  </a>
  <a href="#contacts" class="bnav-item ${State.currentPage==='contacts'?'active':''}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.07 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013 1.22h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 8.9a16 16 0 006 6l1.06-1.06a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
    Контакты
  </a>
</nav>
<a href="tel:+77751731067" class="float-phone" aria-label="Позвонить">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.07 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013 1.22h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 8.9a16 16 0 006 6l1.06-1.06a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
</a>`;

const Footer = () => `
<footer>
  <div class="container">
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="images/logo.jpg" alt="DoniStroi" style="width:72px;height:72px;object-fit:contain;border-radius:50%;margin-bottom:0.75rem">
        <p>Производство и установка современных фасадных материалов в Атырау и Казахстане. Более 5 лет опыта.</p>
      </div>
      <div class="footer-col"><h5>Навигация</h5><ul>
        <li><a href="#home">Главная</a></li><li><a href="#about">О компании</a></li>
        <li><a href="#services">Услуги</a></li><li><a href="#catalog">Каталог</a></li>
        <li><a href="#contacts">Контакты</a></li>
      </ul></div>
      <div class="footer-col"><h5>Услуги</h5><ul>
        <li><a href="#services">Термопанели</a></li><li><a href="#services">Полифасад</a></li>
        <li><a href="#services">Травертин</a></li><li><a href="#contacts">Бесплатный замер</a></li>
        <li><a href="#contacts">3D визуализация</a></li>
      </ul></div>
      <div class="footer-col"><h5>Контакты</h5><ul>
        <li><a href="tel:+77751731067">+7 775 173-10-67</a></li>
        <li><a href="#contacts">Амандосова 74а, Атырау</a></li>
        <li><a href="mailto:alikowmoldir@mail.ru">alikowmoldir@mail.ru</a></li>
      </ul></div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} DoniStroi. Все права защищены.</span>
      <a href="#admin" style="color:var(--clr-muted);font-size:0.72rem">Вход для администратора</a>
    </div>
  </div>
</footer>`;

// ── Pages ─────────────────────────────────────────────────────
const HomePage = () => `
<!-- HERO with Unsplash background -->
<section class="hero">
  <div class="hero-bg" style="background-image:url('${UNSPLASH.hero}')"></div>
  <div class="hero-overlay"></div>
  <div class="container" style="width:100%;position:relative;z-index:2">
    <div class="hero-content">
      <div class="hero-badge"><span class="dot"></span>Атырау и весь Казахстан</div>
      <!-- Mobile-only stat pills -->
      <div class="hero-mobile-stats">
        <div class="hero-pill"><strong>5+</strong> лет опыта</div>
        <div class="hero-pill"><strong>200+</strong> объектов</div>
        <div class="hero-pill"><strong>Гарантия</strong> 20 лет</div>
      </div>
      <h1>Фасады, которые <em>говорят</em><br>сами за себя</h1>
      <p class="hero-desc">Производство и профессиональная установка термопанелей, полифасада и травертина. Преображаем здания — создаём впечатления.</p>
      <div class="hero-actions">
        <button class="btn btn-primary" onclick="openModal()">Оставить заявку ${Icons.arrow}</button>
        <a href="#catalog" class="btn btn-ghost">Смотреть каталог</a>
      </div>
    </div>
    <div class="hero-stats">
      <div class="hero-stat"><div class="num">5+</div><div class="lbl">лет опыта</div></div>
      <div class="hero-stat"><div class="num">200+</div><div class="lbl">объектов</div></div>
      <div class="hero-stat"><div class="num">100%</div><div class="lbl">гарантия</div></div>
    </div>
  </div>
  <div class="hero-scroll"><span>Прокрутите</span><div class="scroll-line"></div></div>
</section>

<!-- FACADE STRIP — three photo tiles -->
<div class="facade-strip">
  ${[UNSPLASH.facade1, UNSPLASH.facade2, UNSPLASH.facade3].map((url, i) => `
    <div class="facade-tile reveal" style="animation-delay:${i*0.1}s">
      <img src="${url}" alt="Фасад ${i+1}" loading="lazy">
    </div>`).join('')}
</div>

<!-- SERVICES -->
<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <div class="section-label">Наши материалы</div>
      <h2>Три материала — безграничные возможности</h2>
    </div>
    <div class="services-grid reveal">
      <div class="service-tile" onclick="Router.navigate('#services')">
        <div class="service-tile-img"><img src="${UNSPLASH.thermo1}" alt="Термопанели" loading="lazy"></div>
        <div class="service-tile-body">
          <div class="tile-num">01</div>
          <div class="tile-icon">${Icons.layer}</div>
          <h3>Фасадные термопанели</h3>
          <p>Утеплитель и декоративная отделка в одном. Тепло, красиво, долговечно.</p>
          <div class="tile-arrow">Подробнее ${Icons.arrow}</div>
        </div>
      </div>
      <div class="service-tile" onclick="Router.navigate('#services')">
        <div class="service-tile-img"><img src="${UNSPLASH.poly1}" alt="Полифасад" loading="lazy"></div>
        <div class="service-tile-body">
          <div class="tile-num">02</div>
          <div class="tile-icon">${Icons.cube}</div>
          <h3>Полифасад</h3>
          <p>Лёгкие полимерные панели с разнообразными текстурами для любого стиля.</p>
          <div class="tile-arrow">Подробнее ${Icons.arrow}</div>
        </div>
      </div>
      <div class="service-tile" onclick="Router.navigate('#services')">
        <div class="service-tile-img"><img src="${UNSPLASH.trav1}" alt="Травертин" loading="lazy"></div>
        <div class="service-tile-body">
          <div class="tile-num">03</div>
          <div class="tile-icon">${Icons.shield}</div>
          <h3>Травертин</h3>
          <p>Натуральный природный камень для тех, кто выбирает роскошь и вечность.</p>
          <div class="tile-arrow">Подробнее ${Icons.arrow}</div>
        </div>
      </div>
    </div>
    <!-- Mobile scroll hint dots -->
    <div class="services-scroll-hint">
      <div class="scroll-dot active"></div>
      <div class="scroll-dot"></div>
      <div class="scroll-dot"></div>
    </div>
  </div>
</section>

<!-- ADVANTAGES -->
<section class="section" style="background:var(--clr-surface);border-top:1px solid var(--clr-border);border-bottom:1px solid var(--clr-border)">
  <div class="container">
    <div class="advantages-wrap">
      <div class="adv-left reveal">
        <div class="section-label">Почему мы</div>
        <h2>Не просто материалы —<br>готовый результат</h2>
        <p style="color:var(--clr-muted);margin-top:1rem">Мы берём на себя весь процесс: от первого звонка до сдачи объекта. Работаем под ключ, даём гарантии.</p>
        <div class="adv-list">
          ${[[Icons.ruler,'Точный монтаж','Бригада с опытом 5+ лет. Соблюдаем технологии и сроки'],
             [Icons.shield,'Гарантия качества','Официальная гарантия на материалы и работы до 20 лет'],
             [Icons.zap,'Быстрые сроки','Среднее время монтажа 300 м² — 5 рабочих дней'],
             [Icons.users,'Личный менеджер','Один специалист ведёт проект от замера до сдачи']
          ].map(([icon,title,desc])=>`
            <div class="adv-item">
              <div class="adv-icon">${icon}</div>
              <div class="adv-text"><h4>${title}</h4><p>${desc}</p></div>
            </div>`).join('')}
        </div>
      </div>
      <div class="adv-right reveal">
        <div class="section-label">Бесплатно для вас</div>
        <h3 style="margin-bottom:1.25rem">Три услуги без оплаты</h3>
        <div class="free-benefits">
          <div class="free-benefit"><span class="free-badge">Бесплатно</span><span>Замер объекта нашим специалистом</span></div>
          <div class="free-benefit"><span class="free-badge">Бесплатно</span><span>Консультация по выбору материалов</span></div>
          <div class="free-benefit"><span class="free-badge">Бесплатно</span><span>3D визуализация дома после замера</span></div>
        </div>
        <div style="margin-top:2rem;padding:1.5rem;background:var(--clr-card);border-radius:var(--radius-md);border:1px solid var(--clr-border)">
          <div style="font-family:'Cormorant Garamond',serif;font-size:1.5rem;margin-bottom:0.5rem">Начните с замера</div>
          <p style="font-size:0.88rem;color:var(--clr-muted);margin-bottom:1.25rem">Наш специалист приедет, обмерит объект и подготовит смету — совершенно бесплатно.</p>
          <button class="btn btn-primary" onclick="openModal()">Записаться на замер</button>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CATALOG PREVIEW -->
<section class="section">
  <div class="container">
    <div class="section-head centered reveal">
      <div class="section-label">Каталог</div>
      <h2>Популярные позиции</h2>
      <p>Широкий ассортимент фасадных материалов на любой бюджет и стиль</p>
    </div>
    <div class="products-grid reveal">
      ${State.products.slice(0,3).map(ProductCard).join('')}
    </div>
    <div style="text-align:center;margin-top:2.5rem" class="reveal">
      <a href="#catalog" class="btn btn-outline">Весь каталог ${Icons.arrow}</a>
    </div>
  </div>
</section>

<!-- REVIEWS -->
<section class="section" style="background:var(--clr-surface);border-top:1px solid var(--clr-border)">
  <div class="container">
    <div class="section-head centered reveal">
      <div class="section-label">Отзывы</div>
      <h2>Клиенты о нас</h2>
    </div>
    <div class="reviews-track">
      ${[
        {name:'Аскар Жумабеков',city:'Атырау',text:'Заказали термопанели для частного дома. Результат превзошёл ожидания — красиво, тепло и быстро. Мастера вежливые, работают аккуратно. Рекомендую!',init:'А'},
        {name:'Гульнара Сейткали',city:'Актобе',text:'Делали 3D-визуализацию перед монтажом — очень удобно, всё согласовали заранее. Полифасад поставили ровно в срок. Фасад получился шикарный.',init:'Г'},
        {name:'Дмитрий Воронов',city:'Атырау',text:'Выбирал между несколькими компаниями, остановился на DoniStroi. Травертин — премиум качество. Монтажники — профессионалы. Буду рекомендовать.',init:'Д'},
      ].map(r=>`
        <div class="review-card reveal">
          <div class="review-stars">${'★'.repeat(5).split('').map(()=>`<span class="star">★</span>`).join('')}</div>
          <p class="review-text">«${r.text}»</p>
          <div class="review-author">
            <div class="author-avatar">${r.init}</div>
            <div><div class="author-name">${r.name}</div><div class="author-city">${r.city}</div></div>
          </div>
        </div>`).join('')}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="section">
  <div class="container reveal">
    <div class="cta-banner">
      <div class="section-label" style="justify-content:center">Готовы начать?</div>
      <h2>Преобразите свой фасад уже сегодня</h2>
      <p>Бесплатная консультация, замер и 3D-проект — без обязательств</p>
      <div class="cta-actions">
        <button class="btn btn-primary" onclick="openModal()">Оставить заявку ${Icons.arrow}</button>
        <a href="tel:+77751731067" class="btn btn-outline">${Icons.phone} Позвонить нам</a>
      </div>
    </div>
  </div>
</section>`;

const AboutPage = () => `
<div class="page-header">
  <div class="container">
    <div class="breadcrumb"><a href="#home">Главная</a><span>/</span><span>О компании</span></div>
    <div class="section-label">Кто мы</div>
    <h1>О компании DoniStroi</h1>
  </div>
</div>
<section class="section">
  <div class="container">
    <div class="about-grid">
      <div class="about-visual reveal">
        <div class="about-img-main">
          <img src="${UNSPLASH.about}" alt="О компании" style="width:100%;height:100%;object-fit:cover">
        </div>
        <div class="about-badge-float">
          <div class="num">5+</div><div class="lbl">лет работы</div>
        </div>
      </div>
      <div class="about-content reveal">
        <div class="section-label">Наша история</div>
        <h2>Строим репутацию<br>год за годом</h2>
        <p style="color:var(--clr-muted);margin:1.5rem 0">DoniStroi основана в 2019 году в Атырау. За это время мы реализовали более 200 проектов — от частных домов до крупных коммерческих объектов по всему Казахстану.</p>
        <p style="color:var(--clr-muted);margin-bottom:1.5rem">Наша специализация — фасадные термопанели, полифасад и травертин. Мы не просто продаём материалы — мы предлагаем комплексное решение: консультацию, 3D-визуализацию, профессиональный монтаж и гарантию на результат.</p>
        <div style="display:flex;gap:2rem">
          ${[['200+','Проектов'],['5+','Лет опыта'],['20','Лет гарантии']].map(([n,l])=>`
          <div><div style="font-family:'Cormorant Garamond',serif;font-size:2.5rem;color:var(--clr-accent)">${n}</div><div style="font-size:0.78rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--clr-muted)">${l}</div></div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>
<section class="section" style="background:var(--clr-surface);border-top:1px solid var(--clr-border)">
  <div class="container">
    <div class="section-head centered reveal">
      <div class="section-label">Наши ценности</div>
      <h2>Причины доверия</h2>
    </div>
    <div class="values-grid">
      ${[['01','Честность','Называем реальные сроки и цены. Без скрытых платежей.'],
         ['02','Качество','Работаем только с сертифицированными материалами.'],
         ['03','Пунктуальность','Соблюдаем договорённости. Если обещали — делаем в срок.'],
         ['04','Сервис','Отвечаем на вопросы даже после сдачи объекта.'],
         ['05','Инновации','Следим за новинками и предлагаем актуальные решения.'],
         ['06','Гарантия','Официальная гарантия до 20 лет на материалы и монтаж.'],
      ].map(([n,h,p])=>`
        <div class="value-card reveal"><div class="value-num">${n}</div><h4>${h}</h4><p>${p}</p></div>`).join('')}
    </div>
  </div>
</section>
<section class="section">
  <div class="container reveal">
    <div class="cta-banner">
      <div class="section-label" style="justify-content:center">Познакомимся?</div>
      <h2>Расскажите о вашем проекте</h2>
      <p>Консультация и замер — бесплатно. Без давления и навязывания.</p>
      <div class="cta-actions">
        <button class="btn btn-primary" onclick="openModal()">Получить консультацию</button>
        <a href="#contacts" class="btn btn-outline">Наши контакты</a>
      </div>
    </div>
  </div>
</section>`;

const ServicesPage = () => `
<div class="page-header">
  <div class="container">
    <div class="breadcrumb"><a href="#home">Главная</a><span>/</span><span>Услуги</span></div>
    <div class="section-label">Что мы делаем</div>
    <h1>Наши услуги</h1>
  </div>
</div>
${[
  {cat:'Термопанели',title:'Фасадные термопанели',imgA:UNSPLASH.thermo1,imgB:UNSPLASH.thermo2,reverse:false,
   desc:'Термопанели — современное фасадное решение, объединяющее утеплитель и декоративную облицовку в одном изделии.',
   features:['Теплоизоляция (энергосбережение до 40%)','Богатый выбор текстур: кирпич, камень, дерево','Простой и быстрый монтаж без мокрых процессов','Морозостойкость до −60°C','Срок эксплуатации 30+ лет','Гарантия 15–20 лет']},
  {cat:'Полифасад',title:'Полимерные панели (Полифасад)',imgA:UNSPLASH.poly1,imgB:UNSPLASH.poly2,reverse:true,
   desc:'Полифасад — лёгкие полимерные панели для вентилируемых фасадов. Доступное и практичное решение.',
   features:['Минимальный вес — не нагружает конструкции','Более 50 цветовых вариантов','Устойчивость к UV, влаге и механическим нагрузкам','Вентилируемый фасад — защита от конденсата','Экономичное решение без потери качества','Гарантия 10–12 лет']},
  {cat:'Травертин',title:'Натуральный травертин',imgA:UNSPLASH.trav1,imgB:UNSPLASH.trav2,reverse:false,
   desc:'Травертин — природный известняк, который использовался в архитектуре тысячелетиями. Каждая плита уникальна.',
   features:['100% натуральный природный камень','Уникальный рисунок каждой плиты','Исключительная прочность и долговечность','Морозостойкость и устойчивость к влаге','Не выгорает и не меняет цвет','Гарантия 50+ лет']},
].map(s=>`
<div class="service-section">
  <div class="container">
    <div class="service-layout${s.reverse?' reverse':''}">
      <div class="service-visual-duo reveal">
        <div class="svc-img-main"><img src="${s.imgA}" alt="${s.cat}" loading="lazy"></div>
        <div class="svc-img-sub"><img src="${s.imgB}" alt="${s.cat} 2" loading="lazy"></div>
      </div>
      <div class="service-content reveal">
        <div class="section-label">${s.cat}</div>
        <h2>${s.title}</h2>
        <p>${s.desc}</p>
        <div class="service-features">
          ${s.features.map(f=>`<div class="service-feature">${f}</div>`).join('')}
        </div>
        <div style="display:flex;gap:1rem;flex-wrap:wrap">
          <a href="#catalog" class="btn btn-primary">Смотреть в каталоге</a>
          <button class="btn btn-outline" onclick="openModal()">Заказать консультацию</button>
        </div>
      </div>
    </div>
  </div>
</div>`).join('')}
<section class="section" style="background:var(--clr-surface);border-top:1px solid var(--clr-border)">
  <div class="container reveal">
    <div class="cta-banner">
      <div class="section-label" style="justify-content:center">Бесплатно</div>
      <h2>Три услуги без оплаты</h2>
      <p>Запишитесь на бесплатный замер — и получите консультацию и 3D-проект в подарок</p>
      <div class="cta-actions">
        <button class="btn btn-primary" onclick="openModal()">Записаться на замер ${Icons.arrow}</button>
      </div>
    </div>
  </div>
</section>`;

const ProductCard = (p) => `
<div class="product-card" onclick="Router.navigate('#product/${p.firestoreId}')">
  <div class="product-img">
    ${productImg(p, 'width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease')}
    ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
  </div>
  <div class="product-info">
    <div class="product-category">${CAT[p.category]||p.category}</div>
    <div class="product-name">${p.name}</div>
    <div class="product-desc">${p.desc}</div>
    <div class="product-footer">
      <div><span class="product-price">${p.price} ₸</span><span class="product-price-unit"> / ${p.unit}</span></div>
      <button class="btn btn-icon">${Icons.arrow}</button>
    </div>
  </div>
</div>`;

const CatalogPage = () => `
<div class="page-header">
  <div class="container">
    <div class="breadcrumb"><a href="#home">Главная</a><span>/</span><span>Каталог</span></div>
    <div class="section-label">Ассортимент</div>
    <h1>Каталог продукции</h1>
  </div>
</div>
<section class="section catalog-page">
  <div class="container">
    <div class="catalog-layout">
      <aside class="catalog-sidebar reveal">
        <div class="filter-group">
          <h5>Категория</h5>
          ${Object.entries(CAT).map(([k,v])=>`
            <div class="filter-option ${State.currentCategory===k?'active':''}" onclick="filterCatalog('${k}')">
              <div class="filter-dot"></div>${v}
              <span style="margin-left:auto;font-size:0.75rem;color:var(--clr-muted)">
                ${k==='all'?State.products.length:State.products.filter(p=>p.category===k).length}
              </span>
            </div>`).join('')}
        </div>
      </aside>
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
          <!-- Mobile filter chips — horizontal scroll -->
          <div class="m-filter-chips">
            ${Object.entries(CAT).map(([k,v])=>`
              <button class="m-chip ${State.currentCategory===k?'active':''}" onclick="filterCatalog('${k}')">${v}</button>`).join('')}
          </div>
          <!-- Desktop pill buttons -->
          <div class="d-filter-pills" style="display:flex;gap:0.5rem;flex-wrap:wrap">
            ${Object.entries(CAT).map(([k,v])=>`
              <button class="btn btn-sm ${State.currentCategory===k?'btn-primary':'btn-ghost'}" onclick="filterCatalog('${k}')">${v}</button>`).join('')}
          </div>
          <span style="font-size:0.82rem;color:var(--clr-muted)">${State.filtered().length} товаров</span>
        </div>
        <div class="products-grid">
          ${State.filtered().length ? State.filtered().map(ProductCard).join('') : `<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--clr-muted)">Товары не найдены</div>`}
        </div>
      </div>
    </div>
  </div>
</section>`;

const ProductPage = () => {
  const p = State.products.find(x => x.firestoreId === State.currentProduct);
  if (!p) return `<div class="container section"><h2>Товар не найден</h2><a href="#catalog" class="btn btn-outline" style="margin-top:1rem">Назад в каталог</a></div>`;
  const galleryImgs = [
    p.imageUrl || CAT_IMG[p.category] || UNSPLASH.facade1,
    UNSPLASH.facade2, UNSPLASH.facade3,
    p.category === 'thermo' ? UNSPLASH.thermo2 : p.category === 'poly' ? UNSPLASH.poly2 : UNSPLASH.trav2
  ];
  return `
<div class="page-header">
  <div class="container">
    <div class="breadcrumb"><a href="#home">Главная</a><span>/</span><a href="#catalog">Каталог</a><span>/</span><span>${p.name}</span></div>
    <div class="section-label">${CAT[p.category]||p.category}</div>
    <h1>${p.name}</h1>
  </div>
</div>
<section class="section">
  <div class="container">
    <div class="product-layout">
      <div class="reveal">
        <div class="gallery-main" id="galleryMain">
          <img id="galleryMainImg" src="${galleryImgs[0]}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover">
        </div>
        <div class="gallery-thumbs">
          ${galleryImgs.map((url,i)=>`
            <div class="thumb ${i===0?'active':''}" onclick="switchGallery(this,'${url}')">
              <img src="${url}" alt="Фото ${i+1}" style="width:100%;height:100%;object-fit:cover" loading="lazy">
            </div>`).join('')}
        </div>
      </div>
      <div class="product-detail reveal">
        ${p.badge?`<div class="product-badge" style="display:inline-block;position:static;margin-bottom:1rem">${p.badge}</div>`:''}
        <h1>${p.name}</h1>
        <div class="product-price-large">${p.price} ₸ <span style="font-size:1rem;color:var(--clr-muted);font-family:'Jost',sans-serif">/ ${p.unit}</span></div>
        <p class="product-desc">${p.fullDesc||p.desc}</p>
        ${p.specs&&Object.keys(p.specs).length?`
        <div class="product-specs">
          <h4 style="font-family:'Jost',sans-serif;font-weight:500;margin-bottom:1rem;font-size:0.8rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--clr-accent)">Характеристики</h4>
          ${Object.entries(p.specs).map(([k,v])=>`<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`).join('')}
        </div>`:''}
        <div class="free-benefits" style="margin-bottom:1.5rem">
          <div class="free-benefit"><span class="free-badge">Бесплатно</span><span>Замер и консультация</span></div>
          <div class="free-benefit"><span class="free-badge">Бесплатно</span><span>3D визуализация дома</span></div>
        </div>
        <div class="product-actions">
          <button class="btn btn-primary" onclick="openModal('${p.name}')" style="flex:1">Заказать ${Icons.arrow}</button>
          <a href="tel:+77751731067" class="btn btn-outline">${Icons.phone}</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
};

const ContactsPage = () => `
<div class="page-header">
  <div class="container">
    <div class="breadcrumb"><a href="#home">Главная</a><span>/</span><span>Контакты</span></div>
    <div class="section-label">Свяжитесь с нами</div>
    <h1>Контакты</h1>
  </div>
</div>
<section class="section">
  <div class="container">
    <div class="contacts-layout">
      <div class="reveal">
        <h2 style="margin-bottom:2rem">Мы всегда на связи</h2>
        <div class="contact-info">
          <div class="contact-card"><div class="contact-icon">${Icons.phone}</div><div><div class="contact-label">Телефон</div><div class="contact-value"><a href="tel:+77751731067">+7 775 173-10-67</a></div></div></div>
          <div class="contact-card"><div class="contact-icon">${Icons.map}</div><div><div class="contact-label">Адрес</div><div class="contact-value">Амандосова 74а, Атырау</div></div></div>
          <div class="contact-card"><div class="contact-icon">${Icons.mail}</div><div><div class="contact-label">Email</div><div class="contact-value"><a href="mailto:alikowmoldir@mail.ru">alikowmoldir@mail.ru</a></div></div></div>
        </div>
        <div class="contact-map">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10758.4!2d51.883!3d47.1067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x41f8d4ed7e3b91df%3A0x6c0af80a2e2b2c37!2z0JDRgtGL0YDQsNGDLCDQkNGC0YvRgNCw0YMg0JzQvtC70LDRiNC6!5e0!3m2!1sru!2skz!4v1700000000000" width="100%" height="100%" style="border:0;filter:grayscale(70%) invert(5%)" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>
      <div class="contact-form-wrap reveal">
        <div class="section-label">Форма обратной связи</div>
        <h3>Оставьте заявку</h3>
        <p>Ответим в течение 30 минут в рабочее время</p>
        <form onsubmit="handleContactForm(event)">
          <div class="form-row">
            <div class="form-group"><label>Имя *</label><input type="text" placeholder="Ваше имя" required></div>
            <div class="form-group"><label>Телефон *</label><input type="tel" placeholder="+7 XXX XXX-XX-XX" required></div>
          </div>
          <div class="form-group"><label>Услуга</label>
            <select><option value="">Выберите услугу</option><option>Фасадные термопанели</option><option>Полифасад</option><option>Травертин</option><option>Бесплатный замер</option><option>Консультация</option></select>
          </div>
          <div class="form-group"><label>Сообщение</label><textarea placeholder="Опишите ваш объект или задайте вопрос"></textarea></div>
          <button type="submit" class="btn btn-primary" style="width:100%">Отправить заявку ${Icons.arrow}</button>
        </form>
      </div>
    </div>
  </div>
</section>`;

const AdminLoginPage = () => `
<section class="section">
  <div class="container">
    <div class="admin-login reveal">
      <div class="section-label">Панель управления</div>
      <h2>Вход для администратора</h2>
      <p>Введите данные для доступа к панели управления каталогом</p>
      <form onsubmit="handleAdminLogin(event)">
        <div class="form-group"><label>Логин</label><input type="text" id="adminLogin" placeholder="admin" required></div>
        <div class="form-group"><label>Пароль</label><input type="password" id="adminPass" placeholder="••••••••" required></div>
        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:0.5rem">Войти ${Icons.arrow}</button>
      </form>
    </div>
  </div>
</section>`;

const AdminPage = () => `
<div class="page-header">
  <div class="container" style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:1rem">
    <div><div class="section-label">Панель управления</div><h1>Каталог товаров</h1></div>
    <div style="display:flex;gap:1rem">
      <button class="btn btn-primary" onclick="openAddProduct()">${Icons.plus} Добавить товар</button>
      <button class="btn btn-ghost" onclick="adminLogout()">${Icons.logout} Выйти</button>
    </div>
  </div>
</div>
<section class="section" style="padding-top:2rem">
  <div class="container">
    <div style="background:var(--clr-surface);border:1px solid var(--clr-border);border-radius:var(--radius-md);overflow:hidden">
      <table class="admin-table">
        <thead><tr><th>Фото</th><th>Название</th><th>Категория</th><th>Цена</th><th>Действия</th></tr></thead>
        <tbody>
          ${State.products.map(p=>`
            <tr>
              <td><div class="product-thumb-mini">
                <img src="${p.imageUrl||CAT_IMG[p.category]||UNSPLASH.facade1}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">
              </div></td>
              <td>
                <div style="font-weight:500;font-size:0.88rem">${p.name}</div>
                <div style="font-size:0.75rem;color:var(--clr-muted)">${p.desc.substring(0,55)}…</div>
              </td>
              <td><span style="font-size:0.78rem;color:var(--clr-accent)">${CAT[p.category]||p.category}</span></td>
              <td><span style="font-weight:500">${p.price} ₸/${p.unit}</span></td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-ghost btn-sm" onclick="openEditProduct('${p.firestoreId}')">${Icons.edit} Изменить</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.firestoreId}')">${Icons.trash}</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${State.products.length===0?`<div style="text-align:center;padding:4rem;color:var(--clr-muted)">Товаров пока нет. Добавьте первый!</div>`:''}
  </div>
</section>`;

// ── Product form modal ────────────────────────────────────────
function ProductFormModal(p = null) {
  const id = p ? p.firestoreId : null;
  return `
<div class="modal-overlay open" id="productModal">
  <div class="modal" style="max-width:580px;max-height:90vh;overflow-y:auto">
    <button class="modal-close" onclick="closeProductModal()">${Icons.x}</button>
    <div class="section-label">${p?'Редактирование':'Новый товар'}</div>
    <h3>${p?'Изменить товар':'Добавить товар'}</h3>
    <p style="margin-bottom:1.5rem">${p?'Обновите данные товара':'Заполните информацию о новом товаре'}</p>
    <form onsubmit="saveProduct(event,'${id}')">
      <div class="form-row">
        <div class="form-group"><label>Название *</label><input type="text" id="pName" value="${p?p.name:''}" required></div>
        <div class="form-group"><label>Категория</label>
          <select id="pCat">
            ${Object.entries(CAT).filter(([k])=>k!=='all').map(([k,v])=>`<option value="${k}" ${p&&p.category===k?'selected':''}>${v}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group"><label>Краткое описание *</label><input type="text" id="pDesc" value="${p?p.desc:''}" required></div>
      <div class="form-group"><label>Полное описание</label><textarea id="pFull">${p?(p.fullDesc||''):''}</textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Цена (₸) *</label><input type="text" id="pPrice" value="${p?p.price:''}" placeholder="2 800" required></div>
        <div class="form-group"><label>Единица</label><input type="text" id="pUnit" value="${p?p.unit:'м²'}" placeholder="м²"></div>
      </div>
      <!-- IMAGE URL field -->
      <div class="form-group">
        <label>${Icons.image} URL фотографии товара</label>
        <input type="url" id="pImage" value="${p?(p.imageUrl||''):''}" placeholder="https://example.com/photo.jpg">
        <div style="margin-top:0.5rem;font-size:0.75rem;color:var(--clr-muted)">Вставьте прямую ссылку на фото. Если оставить пустым — будет использовано стандартное фото категории.</div>
      </div>
      <!-- Image preview -->
      <div id="imgPreviewWrap" style="margin-bottom:1rem;display:${p&&p.imageUrl?'block':'none'}">
        <div style="font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--clr-muted);margin-bottom:0.4rem">Предпросмотр</div>
        <div style="width:100%;height:160px;border-radius:var(--radius-sm);overflow:hidden;border:1px solid var(--clr-border)">
          <img id="imgPreview" src="${p?(p.imageUrl||''):''}" alt="preview" style="width:100%;height:100%;object-fit:cover">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Значок (бейдж)</label><input type="text" id="pBadge" value="${p?(p.badge||''):''}" placeholder="Хит продаж"></div>
      </div>
      <div style="display:flex;gap:1rem;margin-top:0.5rem">
        <button type="submit" class="btn btn-primary" style="flex:1" id="productSaveBtn">
          ${p?'Сохранить изменения':'Добавить товар'}
        </button>
        <button type="button" class="btn btn-ghost" onclick="closeProductModal()">Отмена</button>
      </div>
    </form>
  </div>
</div>`;
}

// ── Request Modal ─────────────────────────────────────────────
const RequestModal = (productName='') => `
<div class="modal-overlay open" id="requestModal">
  <div class="modal">
    <button class="modal-close" onclick="closeModal()">${Icons.x}</button>
    <div class="section-label">Заявка</div>
    <h3>Оставить заявку</h3>
    <p>Перезвоним в течение 15 минут и ответим на все вопросы</p>
    <form onsubmit="handleRequest(event)">
      <div class="form-group"><label>Ваше имя *</label><input type="text" placeholder="Имя" required></div>
      <div class="form-group"><label>Телефон *</label><input type="tel" placeholder="+7 XXX XXX-XX-XX" required></div>
      <div class="form-group"><label>Интересующая услуга</label>
        <select>
          <option value="">${productName||'Выберите услугу'}</option>
          <option>Фасадные термопанели</option><option>Полифасад</option><option>Травертин</option>
          <option>Бесплатный замер</option><option>3D визуализация</option><option>Консультация</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%">Отправить ${Icons.arrow}</button>
      <p style="font-size:0.75rem;color:var(--clr-muted);margin-top:0.75rem;text-align:center">Нажимая кнопку, вы соглашаетесь на обработку персональных данных</p>
    </form>
  </div>
</div>`;

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type='success') {
  const wrap = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(()=>{ t.style.cssText += 'opacity:0;transform:translateX(20px);transition:0.3s'; setTimeout(()=>t.remove(),300); }, 3000);
}

// ── App Render ────────────────────────────────────────────────
const App = {
  render() {
    const app = document.getElementById('app');
    let content = '';
    switch(State.currentPage) {
      case 'home':     content = HomePage(); break;
      case 'about':    content = AboutPage(); break;
      case 'services': content = ServicesPage(); break;
      case 'catalog':  content = CatalogPage(); break;
      case 'product':  content = ProductPage(); break;
      case 'contacts': content = ContactsPage(); break;
      case 'admin':    content = State.isAdmin ? AdminPage() : AdminLoginPage(); break;
      default:         content = HomePage();
    }
    const isHome = State.currentPage === 'home';

    // Smooth page transition — fade main out, swap, fade in
    const oldMain = app.querySelector('main');
    if (oldMain) {
      oldMain.style.transition = 'opacity 0.18s ease';
      oldMain.style.opacity = '0';
    }

    // Short delay so fade-out plays before DOM swap
    const doRender = () => {
      app.innerHTML = Header() +
        `<main style="padding-top:${isHome?'0':'var(--header-h)'}">` + content + `</main>` +
        Footer() + BottomNav();

      // Fade main in
      const newMain = app.querySelector('main');
      if (newMain) {
        newMain.style.opacity = '0';
        newMain.style.transition = 'opacity 0.22s ease';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => { newMain.style.opacity = '1'; });
        });
      }
      this.afterRender();
    };

    if (oldMain) {
      setTimeout(doRender, 160);
    } else {
      doRender();
    }
  },

  afterRender() {
    // Header scroll behaviour
    const header = document.getElementById('header');
    window.removeEventListener('scroll', window._scrollH||null);
    window._scrollH = () => header?.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', window._scrollH);
    window._scrollH();

    // Reveal on scroll — no stagger delay, gentler threshold
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    // Sync scroll dots with services carousel
    const grid = document.querySelector('.services-grid');
    const dots = document.querySelectorAll('.scroll-dot');
    if (grid && dots.length) {
      grid.addEventListener('scroll', () => {
        const idx = Math.round(grid.scrollLeft / grid.offsetWidth * (dots.length));
        dots.forEach((d, i) => d.classList.toggle('active', i === Math.min(idx, dots.length-1)));
      }, { passive: true });
    }

    // Image URL preview in product form
    const imgInput = document.getElementById('pImage');
    if (imgInput) {
      imgInput.addEventListener('input', () => {
        const url = imgInput.value.trim();
        const wrap = document.getElementById('imgPreviewWrap');
        const prev = document.getElementById('imgPreview');
        if (url) { prev.src = url; wrap.style.display = 'block'; }
        else { wrap.style.display = 'none'; }
      });
    }
  }
};

// ── Global handlers ───────────────────────────────────────────
window.Router         = Router;
window.filterCatalog  = (cat) => { State.currentCategory = cat; Router.navigate('#catalog'); };
window.openModal      = (name='') => document.body.insertAdjacentHTML('beforeend', RequestModal(name));
window.closeModal     = () => document.getElementById('requestModal')?.remove();
window.handleRequest  = (e) => { e.preventDefault(); closeModal(); showToast('Заявка отправлена! Перезвоним скоро.'); };
window.handleContactForm = (e) => { e.preventDefault(); e.target.reset(); showToast('Сообщение отправлено!'); };
window.toggleMobileNav = () => {
  document.getElementById('hamburger').classList.toggle('open');
  const nav = document.getElementById('mobileNav');
  nav.classList.toggle('open');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
};
window.closeMobileNav = () => {
  document.getElementById('hamburger')?.classList.remove('open');
  document.getElementById('mobileNav')?.classList.remove('open');
  document.body.style.overflow = '';
};
window.switchGallery = (thumb, url) => {
  document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
  document.getElementById('galleryMainImg').src = url;
};
window.handleAdminLogin = (e) => {
  e.preventDefault();
  const l = document.getElementById('adminLogin').value;
  const p = document.getElementById('adminPass').value;
  if (l===ADMIN_CREDENTIALS.login && p===ADMIN_CREDENTIALS.password) {
    State.isAdmin = true;
    showToast('Добро пожаловать, администратор!');
    App.render();
  } else {
    showToast('Неверные данные входа', 'error');
  }
};
window.adminLogout = () => { State.isAdmin = false; Router.navigate('#home'); showToast('Вы вышли из системы.'); };
window.openAddProduct  = () => document.body.insertAdjacentHTML('beforeend', ProductFormModal());
window.openEditProduct = (id) => {
  const p = State.products.find(x => x.firestoreId === id);
  if (p) document.body.insertAdjacentHTML('beforeend', ProductFormModal(p));
};
window.closeProductModal = () => document.getElementById('productModal')?.remove();

window.saveProduct = async (e, firestoreId) => {
  e.preventDefault();
  const btn = document.getElementById('productSaveBtn');
  btn.textContent = 'Сохранение…';
  btn.disabled = true;
  const data = {
    category: document.getElementById('pCat').value,
    name:     document.getElementById('pName').value,
    desc:     document.getElementById('pDesc').value,
    fullDesc: document.getElementById('pFull').value,
    price:    document.getElementById('pPrice').value,
    unit:     document.getElementById('pUnit').value || 'м²',
    imageUrl: document.getElementById('pImage').value.trim(),
    badge:    document.getElementById('pBadge').value.trim() || null,
    specs:    {}
  };
  try {
    if (firestoreId && firestoreId !== 'null') {
      await DB.updateProduct(firestoreId, data);
      showToast('Товар обновлён!');
    } else {
      await DB.addProduct(data);
      showToast('Товар добавлен!');
    }
    closeProductModal();
    App.render();
  } catch(err) {
    showToast('Ошибка сохранения: ' + err.message, 'error');
    btn.textContent = 'Сохранить';
    btn.disabled = false;
  }
};

window.deleteProduct = async (firestoreId) => {
  if (!confirm('Удалить этот товар из каталога?')) return;
  try {
    await DB.deleteProduct(firestoreId);
    showToast('Товар удалён.', 'error');
    App.render();
  } catch(err) {
    showToast('Ошибка удаления: ' + err.message, 'error');
  }
};

// Close overlay on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.remove();
    document.body.style.overflow = '';
  }
});

// ── Boot ──────────────────────────────────────────────────────
async function boot() {
  try {
    await DB.loadProducts();
  } catch(err) {
    console.warn('Firebase load error:', err);
    // fallback: seed from defaults into state
    State.products = SEED_PRODUCTS.map((p,i) => ({ ...p, firestoreId: 'local_'+i }));
  }
  document.getElementById('initLoader')?.remove();
  Router.init();
}

boot();
