import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Globe icon markup for the locale/region control (source uses an icon-font glyph;
// reproduced here as an inline SVG so it renders without an external asset).
const GLOBE_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path fill="none" stroke="currentColor" stroke-width="1.6" d="M3 12h18M12 3c2.6 2.5 2.6 15.5 0 18M12 3c-2.6 2.5-2.6 15.5 0 18"/>
</svg>`;

/**
 * Upgrade the locale link into an icon button.
 * The nav fragment carries the locale entry as a plain link (label + href) so the
 * copy stays content-authored; here we turn it into the globe control the source shows.
 * @param {Element} navTools The nav-tools section
 */
function decorateLocale(navTools) {
  if (!navTools) return;
  const localeLink = [...navTools.querySelectorAll('a')].find(
    (a) => /region|language|locale/i.test(a.textContent),
  );
  if (!localeLink) return;
  const label = localeLink.textContent.trim();
  const li = localeLink.closest('li') || localeLink;
  const btn = document.createElement('a');
  btn.className = 'nav-locale';
  btn.href = localeLink.getAttribute('href') || '#';
  btn.setAttribute('aria-label', label);
  btn.title = label;
  btn.innerHTML = GLOBE_SVG;
  if (li.tagName === 'LI') {
    li.textContent = '';
    li.append(btn);
    li.classList.add('nav-locale-item');
  } else {
    localeLink.replaceWith(btn);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment — dual-fetch: local (aem up) then DA/EDS production
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/content/nav';
  let fragment = await loadFragment('/content/nav');
  if (!fragment || !fragment.firstElementChild) {
    fragment = await loadFragment(navPath);
  }

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // brand: strip any auto button styling from the logo link
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) {
      brandLink.className = '';
      const bc = brandLink.closest('.button-container');
      if (bc) bc.className = '';
    }
  }

  // tools: turn the locale link into a globe icon button
  const navTools = nav.querySelector('.nav-tools');
  decorateLocale(navTools);

  // Tag utility links so CSS can build the source's mobile-simplified header
  // (mobile shows only Log In + Sign Up; Sign Up renders as a filled pill).
  if (navTools) {
    navTools.querySelectorAll('li').forEach((li) => {
      const a = li.querySelector('a');
      const label = (a?.textContent || '').trim().toLowerCase();
      if (label === 'log in') li.classList.add('nav-tools-login');
      else if (label === 'sign up') li.classList.add('nav-tools-signup');
      else if (label === 'free trial') li.classList.add('nav-tools-freetrial');
    });
  }

  // Ancestry's mobile header has NO hamburger — it simply hides the primary nav
  // and shows logo + Log In + Sign Up. So we intentionally do NOT render a
  // hamburger/drawer; CSS controls what is shown per breakpoint.
  nav.setAttribute('aria-expanded', 'true');

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
