/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Ancestry.com site-wide cleanup.
 *
 * All selectors below were verified by reading migration-work/cleaned.html for
 * the logged-out homepage (LOHP). This is an A/B-tested AEM page: only the
 * visible "BAU" experience is migrated. Hidden A/B duplicates, the site
 * header (separate migration), the global footer (separate migration), lazy-
 * load placeholder images, and tracking pixels are removed here so the import
 * contains only authorable main content (rc3 hero+promo, rc5 body, rc6
 * resources columns).
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // --- Hidden A/B ("Fantasy") experience — remove before block parsing so
    // parsers only ever see the visible BAU content. Verified in cleaned.html:
    //   <div id="BannerRegion" class="noDisplay">                    (line 2, hidden sitewide alert)
    //   <div class="container_1028736199 ...">                       (line 66, rc2 hidden fantasy hero wrapper)
    //   #container-fa4d85a010 .showFantasyHero .noDisplay            (line 67)
    //   <div class="container_1249506560 ...">                       (line 506, hidden fantasy body wrapper)
    //   #container-28b5d0fda6 .showFantasyBody .noDisplay            (line 507)
    // Removing the two wrapper containers also drops the tracking <img>
    // (cmsasset new-hero-DT) that only exists in the hidden rc2 experience.
    WebImporter.DOMUtils.remove(element, [
      '#BannerRegion',
      '.container_1028736199',
      '.container_1249506560',
      '.showFantasyHero',
      '.showFantasyBody',
      '.noDisplay',
    ]);

    // --- Lazy-load placeholder images. Verified in cleaned.html: 13 <img>
    // whose only src is the 1x1 base64 gif (class "lazyImg
    // cmp-image__image--is-loading"), with no data-src/srcset — the real
    // content images use ./images/<hash>.png. Strip the placeholders before
    // parsing so parsers extract only the resolved content images.
    element.querySelectorAll('img[src^="data:image"]').forEach((img) => img.remove());

    // --- Education area (rc5 seq6/seq7): fix desktop/mobile responsive
    // duplication. Both fixes run in beforeTransform so they land before the
    // cards-feature block parser replaces the itemlist.

    // Fix 1: Remove the MOBILE education duplicate. Verified in cleaned.html
    // (line 1956): <div id="container-302e74aee3" class="cmp-container show768
    // container-media-d504501427">. The class container-media-d504501427 is
    // UNIQUE to that mobile container (single occurrence), so we target it
    // specifically — NOT the shared .show768/.show480 responsive classes,
    // which also appear on inline <br>/<span> line-break variants elsewhere.
    // The desktop education block (#container-9ac75caabe .container-media-88b48f4f93)
    // is the migrated rendering and is intentionally left in place.
    WebImporter.DOMUtils.remove(element, ['.container-media-d504501427']);

    // Fix 2: Preserve the desktop education INTRO as default content. Verified
    // in cleaned.html (lines ~1842-1848): the intro <h2>"Learn more about what
    // you can do with Ancestry." + two <p> paragraphs live inside a
    // .text > .cmp-text node that is packed into the FIRST item
    // (#container-9ab59c4bea) of the cards-feature itemlist. When the parser
    // replaces the itemlist (.container-media-88b48f4f93 .cmp-item-list), that
    // intro is lost — including the "Get a deeper understanding…" paragraph
    // missing from the output. Hoist the whole .text intro node out to be a
    // sibling immediately BEFORE the education block container so it survives
    // as default content preceding the cards-feature block. Guarded to no-op
    // if the h2/nodes aren't found (never throws).
    const eduBlockContainer = element.querySelector('.container-media-88b48f4f93');
    if (eduBlockContainer) {
      let introH2 = null;
      eduBlockContainer.querySelectorAll('h2').forEach((h2) => {
        if (!introH2 && h2.textContent.trim().startsWith('Learn more about what you can do with')) {
          introH2 = h2;
        }
      });
      if (introH2) {
        const introNode = introH2.closest('.text') || introH2.closest('.cmp-text');
        if (introNode) {
          eduBlockContainer.before(introNode);
        }
      }
    }

    // Fix 3: rc5 DEFAULT-CONTENT intros — drop the MOBILE responsive copies so
    // EDS doesn't render duplicate headings/paragraphs. The source pairs each
    // intro line with a desktop copy (hide480/hide768) and a mobile copy
    // (show480/show768); the original hides one via CSS, but both become
    // literal repeated text in EDS. Convention (confirmed from the education
    // containers): keep hide*, drop show*. Scoped to the intro nodes ONLY —
    // block itemlists are left untouched so the columns-product /
    // cards-pricing / cards-feature parser output stays as-is. All guarded.

    // 3a & 3b: Product intro (.container-media-e5c16932c5) and Pricing intro
    // (.container-media-a9324d642c). Verified in cleaned.html: each container's
    // intro is two .cmp-text nodes BEFORE the .itemlist, each holding an
    // <h2>/<p> hide480/show480 pair as DIRECT children (product h2 line 1280 /
    // p 1289; pricing h2 1475 / p 1481). Remove only the :scope > .show480
    // direct children of intro .cmp-text nodes that are NOT inside a
    // .cmp-item-list, so nothing the itemlist parsers consume is disturbed.
    ['.container-media-e5c16932c5', '.container-media-a9324d642c'].forEach((sel) => {
      const introContainer = element.querySelector(sel);
      if (!introContainer) return;
      introContainer.querySelectorAll('.cmp-text').forEach((cmpText) => {
        if (cmpText.closest('.cmp-item-list')) return; // itemlist content — leave for parser
        cmpText.querySelectorAll(':scope > .show480').forEach((el) => el.remove());
      });
    });

    // 3c: AncestryPreserve callout (.container-media-788b206008) "Get started"
    // CTA. Verified in cleaned.html: two button anchors — a.cmp-button.show768
    // (line 1450, mobile) and a.cmp-button.hide768 (line 1454, desktop). Remove
    // the mobile one; keep the desktop hide768 variant. Remove the enclosing
    // .button wrapper (div.button.cmp-anc-button) so no empty button shell is
    // left behind.
    const preserveCallout = element.querySelector('.container-media-788b206008');
    if (preserveCallout) {
      const mobileCta = preserveCallout.querySelector('a.cmp-button.show768');
      if (mobileCta) {
        const ctaWrapper = mobileCta.closest('.button');
        (ctaWrapper || mobileCta).remove();
      }
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // --- Non-authorable site chrome (separate orchestrated migrations).
    // Verified in cleaned.html:
    //   <header class="container_1922310524 ...">  (line 8, rc1 header/nav)
    //   <footer class="experiencefragment_1 ...">  (line 2172, rc7 global footer)
    // The genealogy resources columns (rc6, .experiencefragment_193925216)
    // are a <div> inside <main> and are intentionally NOT matched here. The
    // inner "ancestry-footer" is a <div>, not a <footer>, so a footer selector
    // never touches it.
    WebImporter.DOMUtils.remove(element, [
      'header.container_1922310524',
      'footer.experiencefragment_1',
    ]);

    // --- Tracking pixels / ad beacons. Verified in cleaned.html (footer beacon
    // block, lines ~2269-2285) and metadata.json .images.mapping (google/
    // doubleclick, demdex, ispot, yahoo, bing, pointmediatracker, blisspoint).
    // Target by host so real Ancestry CDN content images are never removed.
    WebImporter.DOMUtils.remove(element, [
      'img[src*="doubleclick.net"]',
      'img[src*="adservice.google"]',
      'img[src*="fls.doubleclick"]',
      'img[src*="demdex.net"]',
      'img[src*="ispot.tv"]',
      'img[src*="analytics.yahoo.com"]',
      'img[src*="bat.bing.com"]',
      'img[src*="pointmediatracker.com"]',
      'img[src*="blisspointmedia.com"]',
    ]);

    // --- Leftover non-authorable elements. Verified in cleaned.html:
    // 5 <iframe> (Adobe ID sync + doubleclick activity iframes), 2 <link>.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
