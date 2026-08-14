import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Tag the two rows: utility links (with locale) and legal/copyright
  const rows = footer.querySelectorAll(':scope > div');
  if (rows[0]) rows[0].classList.add('footer-utility');
  if (rows[1]) rows[1].classList.add('footer-legal');

  // Mark the locale control in the utility row (text-only region/language link)
  const utility = footer.querySelector('.footer-utility');
  if (utility) {
    const localeLink = [...utility.querySelectorAll('a')].find(
      (a) => /region|language|locale|United States/i.test(a.textContent),
    );
    if (localeLink) {
      const li = localeLink.closest('li');
      if (li) li.classList.add('footer-locale-item');
    }
  }

  block.append(footer);
}
