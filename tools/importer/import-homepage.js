/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroCollageParser from './parsers/hero-collage.js';
import promoBannerParser from './parsers/promo-banner.js';
import columnsProductParser from './parsers/columns-product.js';
import cardsPricingParser from './parsers/cards-pricing.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import columnsLinksParser from './parsers/columns-links.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/ancestry-cleanup.js';
import sectionsTransformer from './transformers/ancestry-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: "Ancestry.com logged-out homepage (LOHP). Sections: header/nav, hero with headline + CTA + promo banner, product intro (Family History and AncestryDNA) with two-up columns, AncestryPreserve feature callout, three-up pricing/plan comparison cards, 'Learn more' education/resources feature area, genealogy resources link columns, and global footer.",
  urls: [
    'https://www.ancestry.com/',
  ],
  blocks: [
    {
      name: 'hero-collage',
      instances: ['.showBAUHero .a250-gradient'],
    },
    {
      name: 'promo-banner',
      instances: ['.showBAUHero .container-media-4b51e59470'],
    },
    {
      name: 'columns-product',
      instances: ['.showBAUBody .container-media-e5c16932c5 .listNoWrap'],
    },
    {
      name: 'cards-pricing',
      instances: ['.showBAUBody .container-media-a9324d642c .listNoWrap'],
    },
    {
      name: 'cards-feature',
      instances: ['.showBAUBody .container-media-88b48f4f93 .cmp-item-list'],
    },
    {
      name: 'columns-links',
      instances: ['.experiencefragment_193925216 .ancestry-footer .cmp-item-list'],
    },
  ],
  sections: [
    {
      id: 'rc3',
      name: 'Hero + promo banner (BAU)',
      selector: 'body > main > div.container.responsivegrid.content-width__full-width:nth-of-type(2)',
      style: null,
      blocks: ['hero-collage', 'promo-banner'],
      defaultContent: [],
    },
    {
      id: 'rc5',
      name: 'Main body (BAU): product intro, digitization callout, pricing, education',
      selector: 'body > main > div.container_446589296.container.responsivegrid.content-width__full-width',
      style: null,
      blocks: ['columns-product', 'cards-pricing', 'cards-feature'],
      defaultContent: [
        '.showBAUBody .container-media-e5c16932c5 > .cmp-container__container-content > .aem-Grid > .text',
        '.showBAUBody .container-media-788b206008',
        '.showBAUBody .container-media-a9324d642c > .cmp-container__container-content > .aem-Grid > .text',
      ],
    },
    {
      id: 'rc6',
      name: 'Genealogy resources link columns',
      selector: 'body > main > div.experiencefragment_193925216.experiencefragment',
      style: 'resources-grey',
      blocks: ['columns-links'],
      defaultContent: [],
    },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-collage': heroCollageParser,
  'promo-banner': promoBannerParser,
  'columns-product': columnsProductParser,
  'cards-pricing': cardsPricingParser,
  'cards-feature': cardsFeatureParser,
  'columns-links': columnsLinksParser,
};

// TRANSFORMER REGISTRY - cleanup runs first, section breaks/metadata after (only when 2+ sections)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - DOM element to transform (typically document.body)
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document
 * @param {Object} template - embedded PAGE_TEMPLATE
 * @returns {Array} block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup: remove hidden A/B, header, footer, tracking pixels)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (root/homepage maps to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
