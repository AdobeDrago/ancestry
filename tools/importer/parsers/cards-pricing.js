/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-pricing. Base block: cards.
 * Source: https://www.ancestry.com/ (.showBAUBody .container-media-a9324d642c .listNoWrap)
 * Generated: 2026-08-13
 *
 * Library structure: 2 columns per row, one row per card:
 *   cell 1 = icon/image (mandatory), cell 2 = [title, price, description, CTA, "What's included" checklist].
 * Source: a cmp-item-list with one item-wrapper per plan. Each card has an icon image, a title
 * paragraph (hide768/show768 duplicates), a "From $X" price block, a "What's included" list (present
 * twice: an inner .show768 copy and a trailing .hide768 sibling copy), a description paragraph, and a
 * full-width CTA button. We keep one representative copy of each duplicated element and rebuild the
 * checklist as a clean bulleted <ul> (dropping the decorative check-icon spans).
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

  const makeLink = (a) => {
    if (!a) return null;
    const link = document.createElement('a');
    link.href = a.getAttribute('href') || a.href || '';
    link.textContent = clean(a.textContent);
    return link;
  };

  const items = Array.from(element.querySelectorAll(':scope > .cmp-item-list__items > .cmp-item-list__item-wrapper'));

  const cells = [];

  items.forEach((item) => {
    // --- Cell 1: icon image ---
    const img = Array.from(item.querySelectorAll('img'))
      .find((i) => i.src && !i.src.startsWith('data:'));

    // --- Cell 2: text body ---
    const body = [];

    // Title (plan name). Prefer desktop copy; fall back to first bold paragraph.
    const titleP = item.querySelector('.cmp-text p.show768.bold, .cmp-text p.bold');
    if (titleP) {
      const h = document.createElement('h3');
      h.textContent = clean(titleP.textContent);
      body.push(h);
    }

    // Price block: the "From" label and the "$XX.xx" amount live in a single cmp-text.
    // Find the cmp-text whose first paragraph is exactly "From".
    const priceGroup = Array.from(item.querySelectorAll('.cmp-text')).find((t) => {
      const p = t.querySelector('p');
      return p && clean(p.textContent) === 'From';
    });
    if (priceGroup) {
      const price = document.createElement('p');
      const parts = Array.from(priceGroup.querySelectorAll('p')).map((p) => clean(p.textContent)).filter(Boolean);
      price.textContent = parts.join(' ');
      body.push(price);
    }

    // Description paragraph (the .hide768 body copy that is not the checklist header).
    const descP = Array.from(item.querySelectorAll('.cmp-text p.hide768.textxlrg'))
      .find((p) => clean(p.textContent) && clean(p.textContent) !== "What's included:");
    if (descP) {
      const p = document.createElement('p');
      p.textContent = clean(descP.textContent);
      body.push(p);
    }

    // "What's included" checklist. Use the first checklist <ul>; rebuild as clean bullets.
    const srcUl = item.querySelector('ul');
    if (srcUl) {
      const label = document.createElement('p');
      label.textContent = "What's included:";
      body.push(label);
      const ul = document.createElement('ul');
      Array.from(srcUl.querySelectorAll(':scope > li')).forEach((li) => {
        const newLi = document.createElement('li');
        // Drop the decorative icon span (with hidden "Included" screen-reader text).
        const iconSpan = li.querySelector('.icon, .ancBtn, .screenReaderText');
        let txt = li.textContent;
        if (iconSpan) txt = txt.replace(iconSpan.textContent, '');
        newLi.textContent = clean(txt);
        if (newLi.textContent) ul.appendChild(newLi);
      });
      if (ul.children.length) body.push(ul);
    }

    // CTA button.
    const cta = makeLink(item.querySelector('a.cmp-button, a.button'));
    if (cta) body.push(cta);

    // Emit the card row only if it has content.
    if (img || body.length) {
      cells.push([img || '', body.length ? body : '']);
    }
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-pricing', cells });
  element.replaceWith(block);
}
