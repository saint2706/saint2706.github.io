// Interactive client script for /personal/books/
// Handles the book inspection modal dialog with real book covers, keyboard stepping, and access filtering.

export {};

interface BookItem {
  id: string;
  era: number;
  eraName: string;
  eraRoman: string;
  author: string;
  title: string;
  note: string;
  access: 'FREE' | 'BORROW' | 'COMMERCIAL';
  accessLabel: string;
  url: string;
  cover: string;
  publisher: string;
}

const booksDataEl = document.getElementById('books-data');
const booksDialog = document.getElementById('book-modal') as HTMLDialogElement | null;

if (booksDataEl && booksDialog) {
  const books: BookItem[] = JSON.parse(booksDataEl.textContent || '[]');
  let currentIndex = 0;
  let openerEl: HTMLElement | null = null;

  const q = <T extends Element>(sel: string) => booksDialog.querySelector(sel) as T;

  const coverImg = q<HTMLImageElement>('[data-modal-cover-img]');
  const eraTag = q<HTMLElement>('[data-modal-era]');
  const titleEl = q<HTMLElement>('[data-modal-title]');
  const authorEl = q<HTMLElement>('[data-modal-author]');
  const publisherEl = q<HTMLElement>('[data-modal-publisher]');
  const noteEl = q<HTMLElement>('[data-modal-note]');
  const linkEl = q<HTMLAnchorElement>('[data-modal-link]');
  const accessPill = q<HTMLElement>('[data-modal-access-pill]');
  const counterEl = q<HTMLElement>('[data-modal-counter]');

  function showBook(index: number) {
    currentIndex = (index + books.length) % books.length;
    const b = books[currentIndex];

    // Update real book cover image
    if (coverImg) {
      coverImg.src = b.cover;
      coverImg.alt = `${b.title} by ${b.author}`;
    }

    // Update details panel
    if (eraTag) eraTag.textContent = `ERA ${b.eraRoman} · ${b.eraName}`;
    if (titleEl) titleEl.textContent = b.title;
    if (authorEl) authorEl.textContent = b.author;
    if (publisherEl) publisherEl.textContent = `Edition imprint: ${b.publisher}`;
    if (noteEl) noteEl.textContent = `“${b.note}”`;
    if (counterEl) {
      counterEl.textContent = `VOLUME ${String(currentIndex + 1).padStart(2, '0')} OF ${String(books.length).padStart(2, '0')}`;
    }

    if (linkEl) {
      linkEl.href = b.url;
      linkEl.textContent = `Read ${b.title} (${b.accessLabel}) ↗`;
    }

    if (accessPill) {
      accessPill.textContent = b.accessLabel.toUpperCase();
      accessPill.className = `modal-pill access-${b.access.toLowerCase()}`;
    }
  }

  function openBook(id: string, trigger?: HTMLElement) {
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) return;
    openerEl = trigger || null;
    showBook(idx);
    if (!booksDialog!.open) booksDialog!.showModal();
  }

  // Bind clicks on book shelf spines and card triggers
  document.querySelectorAll<HTMLElement>('[data-book-trigger]').forEach(trigger => {
    trigger.addEventListener('click', e => {
      e.preventDefault();
      const id = trigger.dataset.bookTrigger;
      if (id) openBook(id, trigger);
    });
  });

  // Modal navigation controls
  booksDialog.addEventListener('click', e => {
    const target = (e.target as HTMLElement).closest('button');
    if (!target) return;
    if (target.dataset.bookStep) {
      showBook(currentIndex + Number(target.dataset.bookStep));
    } else if (target.hasAttribute('data-modal-close')) {
      booksDialog.close();
    }
  });

  booksDialog.addEventListener('keydown', e => {
    if ((e.target as HTMLElement).closest('a')) return;
    if (e.key === 'ArrowRight') showBook(currentIndex + 1);
    else if (e.key === 'ArrowLeft') showBook(currentIndex - 1);
    else return;
    e.preventDefault();
  });

  booksDialog.addEventListener('close', () => openerEl?.focus());

  // Fast exploration filtering
  const filterBtns = document.querySelectorAll<HTMLButtonElement>('[data-filter]');
  const bookCards = document.querySelectorAll<HTMLElement>('[data-book-card]');
  const shelfSpines = document.querySelectorAll<HTMLElement>('[data-shelf-spine]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter || 'all';

      bookCards.forEach(card => {
        const access = card.dataset.access;
        const era = card.dataset.era;
        const matches =
          filter === 'all' ||
          filter === access ||
          (filter === 'ancients' && (era === '1' || era === '2')) ||
          (filter === 'moderns' && (era === '3' || era === '4' || era === '5'));
        card.hidden = !matches;
      });

      shelfSpines.forEach(spine => {
        const access = spine.dataset.access;
        const era = spine.dataset.era;
        const matches =
          filter === 'all' ||
          filter === access ||
          (filter === 'ancients' && (era === '1' || era === '2')) ||
          (filter === 'moderns' && (era === '3' || era === '4' || era === '5'));
        spine.classList.toggle('dimmed', !matches);
      });
    });
  });
}
