/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-promo. Base block: hero.
 * Source: https://www.ancestry.com/ (.showBAUHero .container-media-4b51e59470)
 * Generated: 2026-08-13
 *
 * Library structure (1 column, 3 rows): row1 = block name; row2 = background image (omitted here,
 * this is a text-only dark banner); row3 = [banner text, CTA].
 * Source is a full-width dark-green promo band: a bold text paragraph (with hide768/show768/show480
 * responsive span duplicates) plus a single outlined button. We keep one representative text copy.
 */
export default function parse(element, { document }) {
  const makeLink = (a) => {
    if (!a) return null;
    const link = document.createElement('a');
    link.href = a.getAttribute('href') || a.href || '';
    link.textContent = (a.textContent || '').replace(/\s+/g, ' ').trim();
    return link;
  };

  // Banner text: promo paragraph. Keep the desktop (.hide768) span copy, preserving inline <b>.
  let text = null;
  const textP = element.querySelector('.cmp-text p, p.bgDark, p.textalt');
  if (textP) {
    const span = textP.querySelector('.hide768') || textP;
    text = document.createElement('p');
    text.innerHTML = span.innerHTML;
  }

  // Outlined CTA.
  const cta = makeLink(element.querySelector('a.cmp-button, a.button, .cmp-button__wrapper a'));

  const contentCell = [];
  if (text) contentCell.push(text);
  if (cta) contentCell.push(cta);

  if (!text && !cta) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells });
  element.replaceWith(block);
}
