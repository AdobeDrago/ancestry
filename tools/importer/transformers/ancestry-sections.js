/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Ancestry.com section breaks + section metadata.
 *
 * Driven by payload.template.sections from page-templates.json (homepage
 * template). Section selectors are DOM-verified boundaries produced by page
 * analysis (confirmed against migration-work/cleaned.html) and are used as-is:
 *   rc3  hero + promo (BAU)          style: null           -> no break, no metadata (first section)
 *   rc5  main body (BAU)             style: null           -> break only
 *   rc6  genealogy resources columns style: 'resources-grey' -> break + Section Metadata
 *
 * Uses both hooks per the reference implementation: breaks are inserted in
 * beforeTransform (while every section element still exists, before block
 * parsers can replaceWith() a section boundary), anchored by a temporary
 * marker attribute; Section Metadata is inserted in afterTransform against
 * that marker (or the surviving original element for the first section).
 * Reverse iteration keeps not-yet-processed section references stable.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      // First section gets no leading break; skip entirely when it also has no style.
      if (i === 0 && !section.style) continue;
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }
  }
}
