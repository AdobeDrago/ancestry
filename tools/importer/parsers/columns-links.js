/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-links. Base block: columns.
 * Source: https://www.ancestry.com/ (.experiencefragment_193925216 .ancestry-footer .cmp-item-list)
 * Generated: 2026-08-13
 *
 * Library structure: 1 row of N columns; each cell holds a heading + a bulleted link list.
 * Source: a cmp-item-list with one item-wrapper per column. Each column has an <h2> (wrapped in <b>)
 * and an <ul.ancestry-cmp-link-list__list> of anchor links. We emit one cell per column containing a
 * clean heading and a rebuilt <ul> of links (preserving href + label).
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

  const items = Array.from(element.querySelectorAll(':scope > .cmp-item-list__items > .cmp-item-list__item-wrapper'));

  const columnCells = items.map((item) => {
    const cell = [];

    // Column heading.
    const headingSrc = item.querySelector('h2, h3, .cmp-text h2, .cmp-text h3');
    if (headingSrc) {
      const h = document.createElement('h3');
      h.textContent = clean(headingSrc.textContent);
      cell.push(h);
    }

    // Link list: rebuild a clean <ul> of anchors.
    const srcUl = item.querySelector('ul');
    if (srcUl) {
      const ul = document.createElement('ul');
      Array.from(srcUl.querySelectorAll(':scope > li')).forEach((li) => {
        const a = li.querySelector('a');
        if (!a) return;
        const newLi = document.createElement('li');
        const link = document.createElement('a');
        link.href = a.getAttribute('href') || a.href || '';
        link.textContent = clean(a.textContent);
        newLi.appendChild(link);
        ul.appendChild(newLi);
      });
      if (ul.children.length) cell.push(ul);
    }

    return cell;
  }).filter((cell) => cell.length > 0);

  if (columnCells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push(columnCells); // single row, one cell per link column

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-links', cells });
  element.replaceWith(block);
}
