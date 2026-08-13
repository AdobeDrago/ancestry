import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Split a plain "From $24.99 /mo." price paragraph into styled parts so we can
 * reproduce the source's large-number-with-superscripts price typography.
 * Leaves the paragraph untouched if it does not match the expected pattern.
 */
function enhancePrice(scope) {
  const priceP = [...scope.querySelectorAll('p')].find((p) => /^\s*From\b.*\$/.test(p.textContent));
  if (!priceP) return;
  const m = priceP.textContent.trim().match(/^From\s*(\$)([\d,]+)(\.\d+)?(.*)$/);
  if (!m) return;
  const [, symbol, whole, decimals, rest] = m;

  priceP.textContent = '';
  priceP.className = 'cards-pricing-price';

  const from = document.createElement('span');
  from.className = 'cards-pricing-price-from';
  from.textContent = 'From';

  const amount = document.createElement('span');
  amount.className = 'cards-pricing-price-amount';

  const sym = document.createElement('sup');
  sym.className = 'cards-pricing-price-symbol';
  sym.textContent = symbol;

  const num = document.createElement('span');
  num.className = 'cards-pricing-price-number';
  num.textContent = whole;

  amount.append(sym, num);

  const suffixText = (decimals || '') + (rest || '');
  if (suffixText.trim()) {
    const sup = document.createElement('sup');
    sup.className = 'cards-pricing-price-suffix';
    sup.textContent = suffixText;
    amount.append(sup);
  }

  priceP.append(from, amount);
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-pricing-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    // Identify the authored cells: image cell (icon) + body cell (text).
    let imageCell = null;
    let bodyCell = null;
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) imageCell = div;
      else bodyCell = div;
    });

    // Rebuild into a colored panel (icon + title + price + desc + CTA) and a
    // features zone (What's included + checklist) that sits below the panel,
    // matching the source layout.
    const panel = document.createElement('div');
    panel.className = 'cards-pricing-panel';
    const features = document.createElement('div');
    features.className = 'cards-pricing-features';

    const header = document.createElement('div');
    header.className = 'cards-pricing-header';
    if (imageCell) {
      const iconWrap = document.createElement('div');
      iconWrap.className = 'cards-pricing-icon';
      while (imageCell.firstChild) iconWrap.append(imageCell.firstChild);
      header.append(iconWrap);
      imageCell.remove();
    }
    if (bodyCell) {
      const title = bodyCell.querySelector('h1, h2, h3, h4, h5, h6');
      if (title) header.append(title);
      panel.append(header);

      const list = bodyCell.querySelector('ul');
      const includedLabel = list && list.previousElementSibling
        && list.previousElementSibling.tagName === 'P'
        ? list.previousElementSibling : null;

      [...bodyCell.children].forEach((el) => {
        if (el === list) {
          features.append(el);
        } else if (el === includedLabel) {
          el.className = 'cards-pricing-included';
          features.append(el);
        } else {
          panel.append(el);
        }
      });
      bodyCell.remove();
    } else {
      panel.append(header);
    }

    enhancePrice(panel);

    li.textContent = '';
    li.append(panel);
    if (features.children.length) li.append(features);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
