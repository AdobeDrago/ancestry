export default function decorate(block) {
  // The default hero (image background + overlaid heading) needs no JS.
  // The `collage` variant lays out a centered text column above a full-bleed
  // photo collage, so tag the image row and the content row for the CSS and
  // drop any empty rows left over from authoring/import.
  if (!block.classList.contains('collage')) return;

  [...block.children].forEach((row) => {
    if (row.querySelector('picture')) {
      row.classList.add('hero-image');
    } else if (row.textContent.trim()) {
      row.classList.add('hero-content');
    } else {
      row.remove();
    }
  });
}
