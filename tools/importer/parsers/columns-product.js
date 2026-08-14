/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-product. Base block: columns.
 * Source: https://www.ancestry.com/ (.showBAUBody .container-media-e5c16932c5 .listNoWrap)
 * Generated: 2026-08-13
 *
 * Library structure: 1 row of N columns; each cell holds image + heading + paragraph + CTA.
 * Source: a cmp-item-list with one item-wrapper per product. Within each product the DOM has
 * responsive duplicates:
 *  - heading paragraph: desktop (.hide480) vs mobile (.show480)
 *  - "Learn more" CTA appears twice (an inner .show480 copy and an outer .hide480 copy)
 * We emit one representative (desktop) copy of the heading, the body paragraph, and one CTA.
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

  const columnCells = items.map((item) => {
    const cell = [];

    // Product image (first non-placeholder image).
    const img = Array.from(item.querySelectorAll('img'))
      .find((i) => i.src && !i.src.startsWith('data:'));
    if (img) cell.push(img);

    // Heading paragraph: prefer desktop (.hide480) copy, converted to a heading.
    const headingP = item.querySelector('.cmp-text p.hide480, .cmp-text p.bold');
    if (headingP) {
      const h = document.createElement('h3');
      h.textContent = clean(headingP.textContent);
      cell.push(h);
    }

    // Body paragraph: desktop (.hide768) copy of the descriptive text (not the bold heading).
    const bodyP = item.querySelector('.cmp-text p.hide768.textxlrg, .cmp-text p.textxlrg:not(.bold)');
    if (bodyP) {
      const p = document.createElement('p');
      p.textContent = clean(bodyP.textContent);
      cell.push(p);
    }

    // CTA: dedupe the two responsive copies by href, keep the first.
    const seen = new Set();
    Array.from(item.querySelectorAll('a.cmp-button, a.button')).forEach((a) => {
      const href = a.getAttribute('href') || a.href || '';
      if (seen.has(href)) return;
      seen.add(href);
      const link = makeLink(a);
      if (link) cell.push(link);
    });

    return cell;
  }).filter((cell) => cell.length > 0);

  if (columnCells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push(columnCells); // single row, one cell per product column

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-product', cells });
  element.replaceWith(block);
}
