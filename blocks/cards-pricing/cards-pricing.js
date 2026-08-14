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

/**
 * Normalize an authored background-color value. Accepts hex (e.g. #f6f3f0) or
 * rgb()/rgba() (space- or comma-separated, e.g. "rgb(228 239 231)"). A stray
 * trailing ";" is stripped. Returns '' when the value is not a recognizable
 * color, so a malformed cell falls back to the default panel background rather
 * than injecting arbitrary text into the style attribute.
 */
function normalizeColor(raw) {
  if (!raw) return '';
  const value = raw.replace(/;/g, '').trim();
  const isHex = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value);
  const isRgb = /^rgba?\([\d\s.,%/]+\)$/i.test(value);
  return isHex || isRgb ? value : '';
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const [colorCell, contentCell, listCell] = row.children;

    const li = document.createElement('li');
    li.className = 'cards-pricing-card';

    // --- Colored panel: title + price + description + CTA ---
    const panel = document.createElement('div');
    panel.className = 'cards-pricing-panel';

    // First cell defines the panel background color.
    if (colorCell) {
      const color = normalizeColor(colorCell.textContent);
      if (color) panel.style.backgroundColor = color;
    }

    // Second cell holds the panel content (title, price, description).
    if (contentCell) {
      while (contentCell.firstElementChild) panel.append(contentCell.firstElementChild);
    }

    // --- Features zone: "What's included" + checklist (below the panel) ---
    const features = document.createElement('div');
    features.className = 'cards-pricing-features';

    // Third cell holds the checklist plus the CTA. The CTA (a link in its own
    // paragraph) moves into the panel; the label + list stay in the features
    // zone below the panel.
    if (listCell) {
      const cta = [...listCell.children].find((el) => el.tagName === 'P' && el.querySelector('a'));
      [...listCell.children].forEach((el) => {
        if (el === cta) return;
        if (el.tagName === 'P') el.className = 'cards-pricing-included';
        features.append(el);
      });
      if (cta) panel.append(cta);
    }

    enhancePrice(panel);

    li.append(panel);
    if (features.children.length) li.append(features);
    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
