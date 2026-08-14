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
  // and prefix it with a globe icon, matching the production footer.
  const utility = footer.querySelector('.footer-utility');
  if (utility) {
    const localeLink = [...utility.querySelectorAll('a')].find(
      (a) => /region|language|locale|United States/i.test(a.textContent),
    );
    if (localeLink) {
      const li = localeLink.closest('li');
      if (li) li.classList.add('footer-locale-item');
      localeLink.classList.add('footer-locale-link');
      if (!localeLink.querySelector('.footer-locale-icon')) {
        localeLink.insertAdjacentHTML(
          'afterbegin',
          `<svg class="footer-locale-icon" viewBox="0 0 24 24" width="16" height="16"
            fill="none" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M3 12h18"></path>
            <path d="M12 3c2.5 2.6 3.9 5.7 3.9 9s-1.4 6.4-3.9 9c-2.5-2.6-3.9-5.7-3.9-9S9.5 5.6 12 3Z"></path>
          </svg>`,
        );
      }
    }
  }

  // Add the "Do Not Sell or Share My Personal Information" legal link, which the
  // production footer places between "CCPA Notice at Collection" and
  // "Consumer Health Privacy". Injected here because it is absent from the
  // authored footer fragment.
  const legalList = footer.querySelector('.footer-legal ul');
  if (legalList && !/Do Not Sell/i.test(legalList.textContent)) {
    const ccpaItem = [...legalList.querySelectorAll('li')].find(
      (li) => /CCPA Notice at Collection/i.test(li.textContent),
    );
    if (ccpaItem) {
      const doNotSell = document.createElement('li');
      const link = document.createElement('a');
      link.href = 'https://www.ancestry.com/c/legal/privacychoices';
      link.title = 'Do Not Sell or Share My Personal Information';
      link.textContent = 'Do Not Sell or Share My Personal Information';
      doNotSell.append(link);
      ccpaItem.after(doNotSell);
    }
  }

  block.append(footer);
}
