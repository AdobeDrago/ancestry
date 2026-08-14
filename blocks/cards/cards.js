import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const picture = div.querySelector('picture');
      if (picture) {
        div.className = 'cards-card-image';
        // The image cell may also carry text (e.g. a card heading). When it
        // does, keep the image last so the text renders ABOVE it.
        const pictureWrapper = picture.closest('p') || picture;
        pictureWrapper.classList.add('cards-card-image-pic');
        div.append(pictureWrapper);
      } else {
        div.className = 'cards-card-body';
      }
    });
    ul.append(li);
  });

  // replace images with optimized versions
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  block.replaceChildren(ul);
}
