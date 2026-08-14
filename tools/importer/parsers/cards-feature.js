/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base block: cards.
 * Source: https://www.ancestry.com/ (.showBAUBody .container-media-88b48f4f93 .cmp-item-list)
 * Generated: 2026-08-13
 *
 * Library structure: 2 columns per row, one row per card:
 *   cell 1 = image (mandatory), cell 2 = [heading, paragraph(s), CTA].
 * Source: a cmp-item-list whose item-wrappers do NOT map 1:1 to cards — the first wrapper also
 * carries an intro (h2 + lead paragraphs, which is default content and excluded here), and a later
 * wrapper packs two feature cards. So we anchor cards on each <h3> heading: each feature card = one
 * <h3> + the following body paragraphs + the CTA within its containing block, paired with the image
 * that precedes that heading. The intro <h2> and its paragraphs are intentionally skipped.
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

  // Collect every content image (non-placeholder) in document order.
  const images = Array.from(element.querySelectorAll('img'))
    .filter((i) => i.src && !i.src.startsWith('data:'));

  // Each feature card is anchored by an <h3> heading.
  const headings = Array.from(element.querySelectorAll('h3'));

  const cells = [];

  headings.forEach((h3, idx) => {
    const body = [];
    const heading = document.createElement('h3');
    heading.textContent = clean(h3.textContent);
    body.push(heading);

    // Body paragraphs: the paragraphs that are siblings of the heading inside the same cmp-text.
    const textGroup = h3.closest('.cmp-text') || h3.parentElement;
    if (textGroup) {
      Array.from(textGroup.querySelectorAll('p')).forEach((p) => {
        const txt = clean(p.textContent);
        if (txt) {
          const np = document.createElement('p');
          np.textContent = txt;
          body.push(np);
        }
      });
    }

    // CTA: the button that follows this heading's text block within its card container.
    // Walk up to the card container (the .cmp-item-list__item or nearest container) and find the
    // button whose position follows this heading.
    let cta = null;
    const scope = h3.closest('.cmp-container__container-content') || element;
    const buttons = Array.from(scope.querySelectorAll('a.cmp-button, a.button'));
    // Choose the first button that appears after the heading in DOM order.
    for (const b of buttons) {
      if (h3.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
        cta = makeLink(b);
        break;
      }
    }
    if (!cta && buttons.length) cta = makeLink(buttons[0]);
    if (cta) body.push(cta);

    const img = images[idx] || null;
    cells.push([img || '', body]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
