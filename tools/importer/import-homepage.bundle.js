/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-collage.js
  function parse(element, { document: document2 }) {
    const makeLink = (a) => {
      if (!a) return null;
      const link = document2.createElement("a");
      link.href = a.getAttribute("href") || a.href || "";
      link.textContent = (a.textContent || "").replace(/\s+/g, " ").trim();
      return link;
    };
    const bgImage = Array.from(element.querySelectorAll("img")).find((img) => img.src && !img.src.startsWith("data:"));
    let heading = null;
    const h1src = element.querySelector('h1, h2, [class*="title"]');
    if (h1src) {
      const span = h1src.querySelector(".hide768") || h1src;
      heading = document2.createElement("h1");
      heading.innerHTML = span.innerHTML;
    }
    const subheading = element.querySelector("p.hide480.bold, .cmp-text p.bold:not(.show480):not(.show768)");
    const cta = makeLink(element.querySelector("a.cmp-button, a.button, .cmp-button__wrapper a"));
    const finePrint = element.querySelector('p.textsml, p[class*="sml"]');
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (subheading) contentCell.push(subheading);
    if (cta) contentCell.push(cta);
    if (finePrint) contentCell.push(finePrint);
    if (!heading && contentCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) cells.push([bgImage]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-collage", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/promo-banner.js
  function parse2(element, { document: document2 }) {
    const makeLink = (a) => {
      if (!a) return null;
      const link = document2.createElement("a");
      link.href = a.getAttribute("href") || a.href || "";
      link.textContent = (a.textContent || "").replace(/\s+/g, " ").trim();
      return link;
    };
    let text = null;
    const textP = element.querySelector(".cmp-text p, p.bgDark, p.textalt");
    if (textP) {
      const span = textP.querySelector(".hide768") || textP;
      text = document2.createElement("p");
      text.innerHTML = span.innerHTML;
    }
    const cta = makeLink(element.querySelector("a.cmp-button, a.button, .cmp-button__wrapper a"));
    const contentCell = [];
    if (text) contentCell.push(text);
    if (cta) contentCell.push(cta);
    if (!text && !cta) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "promo-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-product.js
  function parse3(element, { document: document2 }) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const makeLink = (a) => {
      if (!a) return null;
      const link = document2.createElement("a");
      link.href = a.getAttribute("href") || a.href || "";
      link.textContent = clean(a.textContent);
      return link;
    };
    const items = Array.from(element.querySelectorAll(":scope > .cmp-item-list__items > .cmp-item-list__item-wrapper"));
    const columnCells = items.map((item) => {
      const cell = [];
      const img = Array.from(item.querySelectorAll("img")).find((i) => i.src && !i.src.startsWith("data:"));
      if (img) cell.push(img);
      const headingP = item.querySelector(".cmp-text p.hide480, .cmp-text p.bold");
      if (headingP) {
        const h = document2.createElement("h3");
        h.textContent = clean(headingP.textContent);
        cell.push(h);
      }
      const bodyP = item.querySelector(".cmp-text p.hide768.textxlrg, .cmp-text p.textxlrg:not(.bold)");
      if (bodyP) {
        const p = document2.createElement("p");
        p.textContent = clean(bodyP.textContent);
        cell.push(p);
      }
      const seen = /* @__PURE__ */ new Set();
      Array.from(item.querySelectorAll("a.cmp-button, a.button")).forEach((a) => {
        const href = a.getAttribute("href") || a.href || "";
        if (seen.has(href)) return;
        seen.add(href);
        const link = makeLink(a);
        if (link) cell.push(link);
      });
      return cell;
    }).filter((cell) => cell.length > 0);
    if (columnCells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push(columnCells);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-pricing.js
  function parse4(element, { document: document2 }) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const makeLink = (a) => {
      if (!a) return null;
      const link = document2.createElement("a");
      link.href = a.getAttribute("href") || a.href || "";
      link.textContent = clean(a.textContent);
      return link;
    };
    const items = Array.from(element.querySelectorAll(":scope > .cmp-item-list__items > .cmp-item-list__item-wrapper"));
    const cells = [];
    items.forEach((item) => {
      const img = Array.from(item.querySelectorAll("img")).find((i) => i.src && !i.src.startsWith("data:"));
      const body = [];
      const titleP = item.querySelector(".cmp-text p.show768.bold, .cmp-text p.bold");
      if (titleP) {
        const h = document2.createElement("h3");
        h.textContent = clean(titleP.textContent);
        body.push(h);
      }
      const priceGroup = Array.from(item.querySelectorAll(".cmp-text")).find((t) => {
        const p = t.querySelector("p");
        return p && clean(p.textContent) === "From";
      });
      if (priceGroup) {
        const price = document2.createElement("p");
        const parts = Array.from(priceGroup.querySelectorAll("p")).map((p) => clean(p.textContent)).filter(Boolean);
        price.textContent = parts.join(" ");
        body.push(price);
      }
      const descP = Array.from(item.querySelectorAll(".cmp-text p.hide768.textxlrg")).find((p) => clean(p.textContent) && clean(p.textContent) !== "What's included:");
      if (descP) {
        const p = document2.createElement("p");
        p.textContent = clean(descP.textContent);
        body.push(p);
      }
      const srcUl = item.querySelector("ul");
      if (srcUl) {
        const label = document2.createElement("p");
        label.textContent = "What's included:";
        body.push(label);
        const ul = document2.createElement("ul");
        Array.from(srcUl.querySelectorAll(":scope > li")).forEach((li) => {
          const newLi = document2.createElement("li");
          const iconSpan = li.querySelector(".icon, .ancBtn, .screenReaderText");
          let txt = li.textContent;
          if (iconSpan) txt = txt.replace(iconSpan.textContent, "");
          newLi.textContent = clean(txt);
          if (newLi.textContent) ul.appendChild(newLi);
        });
        if (ul.children.length) body.push(ul);
      }
      const cta = makeLink(item.querySelector("a.cmp-button, a.button"));
      if (cta) body.push(cta);
      if (img || body.length) {
        cells.push([img || "", body.length ? body : ""]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-pricing", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse5(element, { document: document2 }) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const makeLink = (a) => {
      if (!a) return null;
      const link = document2.createElement("a");
      link.href = a.getAttribute("href") || a.href || "";
      link.textContent = clean(a.textContent);
      return link;
    };
    const images = Array.from(element.querySelectorAll("img")).filter((i) => i.src && !i.src.startsWith("data:"));
    const headings = Array.from(element.querySelectorAll("h3"));
    const cells = [];
    headings.forEach((h3, idx) => {
      const body = [];
      const heading = document2.createElement("h3");
      heading.textContent = clean(h3.textContent);
      body.push(heading);
      const textGroup = h3.closest(".cmp-text") || h3.parentElement;
      if (textGroup) {
        Array.from(textGroup.querySelectorAll("p")).forEach((p) => {
          const txt = clean(p.textContent);
          if (txt) {
            const np = document2.createElement("p");
            np.textContent = txt;
            body.push(np);
          }
        });
      }
      let cta = null;
      const scope = h3.closest(".cmp-container__container-content") || element;
      const buttons = Array.from(scope.querySelectorAll("a.cmp-button, a.button"));
      for (const b of buttons) {
        if (h3.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
          cta = makeLink(b);
          break;
        }
      }
      if (!cta && buttons.length) cta = makeLink(buttons[0]);
      if (cta) body.push(cta);
      const img = images[idx] || null;
      cells.push([img || "", body]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-links.js
  function parse6(element, { document: document2 }) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const items = Array.from(element.querySelectorAll(":scope > .cmp-item-list__items > .cmp-item-list__item-wrapper"));
    const columnCells = items.map((item) => {
      const cell = [];
      const headingSrc = item.querySelector("h2, h3, .cmp-text h2, .cmp-text h3");
      if (headingSrc) {
        const h = document2.createElement("h3");
        h.textContent = clean(headingSrc.textContent);
        cell.push(h);
      }
      const srcUl = item.querySelector("ul");
      if (srcUl) {
        const ul = document2.createElement("ul");
        Array.from(srcUl.querySelectorAll(":scope > li")).forEach((li) => {
          const a = li.querySelector("a");
          if (!a) return;
          const newLi = document2.createElement("li");
          const link = document2.createElement("a");
          link.href = a.getAttribute("href") || a.href || "";
          link.textContent = clean(a.textContent);
          newLi.appendChild(link);
          ul.appendChild(newLi);
        });
        if (ul.children.length) cell.push(ul);
      }
      return cell;
    }).filter((cell) => cell.length > 0);
    if (columnCells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push(columnCells);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/ancestry-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#BannerRegion",
        ".container_1028736199",
        ".container_1249506560",
        ".showFantasyHero",
        ".showFantasyBody",
        ".noDisplay"
      ]);
      element.querySelectorAll('img[src^="data:image"]').forEach((img) => img.remove());
      WebImporter.DOMUtils.remove(element, [".container-media-d504501427"]);
      const eduBlockContainer = element.querySelector(".container-media-88b48f4f93");
      if (eduBlockContainer) {
        let introH2 = null;
        eduBlockContainer.querySelectorAll("h2").forEach((h2) => {
          if (!introH2 && h2.textContent.trim().startsWith("Learn more about what you can do with")) {
            introH2 = h2;
          }
        });
        if (introH2) {
          const introNode = introH2.closest(".text") || introH2.closest(".cmp-text");
          if (introNode) {
            eduBlockContainer.before(introNode);
          }
        }
      }
      [".container-media-e5c16932c5", ".container-media-a9324d642c"].forEach((sel) => {
        const introContainer = element.querySelector(sel);
        if (!introContainer) return;
        introContainer.querySelectorAll(".cmp-text").forEach((cmpText) => {
          if (cmpText.closest(".cmp-item-list")) return;
          cmpText.querySelectorAll(":scope > .show480").forEach((el) => el.remove());
        });
      });
      const preserveCallout = element.querySelector(".container-media-788b206008");
      if (preserveCallout) {
        const mobileCta = preserveCallout.querySelector("a.cmp-button.show768");
        if (mobileCta) {
          const ctaWrapper = mobileCta.closest(".button");
          (ctaWrapper || mobileCta).remove();
        }
      }
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.container_1922310524",
        "footer.experiencefragment_1"
      ]);
      WebImporter.DOMUtils.remove(element, [
        'img[src*="doubleclick.net"]',
        'img[src*="adservice.google"]',
        'img[src*="fls.doubleclick"]',
        'img[src*="demdex.net"]',
        'img[src*="ispot.tv"]',
        'img[src*="analytics.yahoo.com"]',
        'img[src*="bat.bing.com"]',
        'img[src*="pointmediatracker.com"]',
        'img[src*="blisspointmedia.com"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/ancestry-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Ancestry.com logged-out homepage (LOHP). Sections: header/nav, hero with headline + CTA + promo banner, product intro (Family History and AncestryDNA) with two-up columns, AncestryPreserve feature callout, three-up pricing/plan comparison cards, 'Learn more' education/resources feature area, genealogy resources link columns, and global footer.",
    urls: [
      "https://www.ancestry.com/"
    ],
    blocks: [
      {
        name: "hero-collage",
        instances: [".showBAUHero .a250-gradient"]
      },
      {
        name: "promo-banner",
        instances: [".showBAUHero .container-media-4b51e59470"]
      },
      {
        name: "columns-product",
        instances: [".showBAUBody .container-media-e5c16932c5 .listNoWrap"]
      },
      {
        name: "cards-pricing",
        instances: [".showBAUBody .container-media-a9324d642c .listNoWrap"]
      },
      {
        name: "cards-feature",
        instances: [".showBAUBody .container-media-88b48f4f93 .cmp-item-list"]
      },
      {
        name: "columns-links",
        instances: [".experiencefragment_193925216 .ancestry-footer .cmp-item-list"]
      }
    ],
    sections: [
      {
        id: "rc3",
        name: "Hero + promo banner (BAU)",
        selector: "body > main > div.container.responsivegrid.content-width__full-width:nth-of-type(2)",
        style: null,
        blocks: ["hero-collage", "promo-banner"],
        defaultContent: []
      },
      {
        id: "rc5",
        name: "Main body (BAU): product intro, digitization callout, pricing, education",
        selector: "body > main > div.container_446589296.container.responsivegrid.content-width__full-width",
        style: null,
        blocks: ["columns-product", "cards-pricing", "cards-feature"],
        defaultContent: [
          ".showBAUBody .container-media-e5c16932c5 > .cmp-container__container-content > .aem-Grid > .text",
          ".showBAUBody .container-media-788b206008",
          ".showBAUBody .container-media-a9324d642c > .cmp-container__container-content > .aem-Grid > .text"
        ]
      },
      {
        id: "rc6",
        name: "Genealogy resources link columns",
        selector: "body > main > div.experiencefragment_193925216.experiencefragment",
        style: "resources-grey",
        blocks: ["columns-links"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "hero-collage": parse,
    "promo-banner": parse2,
    "columns-product": parse3,
    "cards-pricing": parse4,
    "cards-feature": parse5,
    "columns-links": parse6
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
