/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-collage. Base block: hero.
 * Source: https://www.ancestry.com/ (.showBAUHero .a250-gradient)
 * Generated: 2026-08-13
 *
 * Library structure (1 column, 3 rows): row1 = block name; row2 = background image;
 * row3 = [title, subheading, CTA, fine-print].
 * Source uses AEM cmp-* markup with hide768/show768/show480 responsive duplicates of the
 * heading and subheading — we keep a single representative (desktop) copy of each.
 */
export default function parse(element, { document }) {
  // Return a fresh, clean anchor (href + label) to avoid nested block markup in the CTA.
  const makeLink = (a) => {
    if (!a) return null;
    const link = document.createElement('a');
    link.href = a.getAttribute('href') || a.href || '';
    link.textContent = (a.textContent || '').replace(/\s+/g, ' ').trim();
    return link;
  };

  // Background image (optional): first non-placeholder image in the block.
  const bgImage = Array.from(element.querySelectorAll('img'))
    .find((img) => img.src && !img.src.startsWith('data:'));

  // Heading: <h1> with responsive span duplicates. Keep the desktop (.hide768) copy.
  let heading = null;
  const h1src = element.querySelector('h1, h2, [class*="title"]');
  if (h1src) {
    const span = h1src.querySelector('.hide768') || h1src;
    heading = document.createElement('h1');
    heading.innerHTML = span.innerHTML;
  }

  // Subheading: bold intro paragraph (desktop copy is the .hide480 variant).
  const subheading = element.querySelector('p.hide480.bold, .cmp-text p.bold:not(.show480):not(.show768)');

  // Primary CTA.
  const cta = makeLink(element.querySelector('a.cmp-button, a.button, .cmp-button__wrapper a'));

  // Fine print.
  const finePrint = element.querySelector('p.textsml, p[class*="sml"]');

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  if (cta) contentCell.push(cta);
  if (finePrint) contentCell.push(finePrint);

  if (!heading && contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (bgImage) cells.push([bgImage]);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-collage', cells });
  element.replaceWith(block);
}
