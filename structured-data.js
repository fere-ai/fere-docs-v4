// Mintlify does not emit JSON-LD on this site (checked Oct 2026), so add the
// publisher on every page and, on /faq, a FAQPage read from the rendered
// accordions so the schema can never drift from the visible answers.
(function () {
  var ORG_ID = "https://www.fereai.xyz/#organization";
  var ORGANIZATION = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Fere AI",
    url: "https://www.fereai.xyz/",
    logo: {
      "@type": "ImageObject",
      url: "https://cdn.fereai.xyz/logo/fere-standalone-logo.webp",
    },
    sameAs: [
      "https://x.com/fere_ai",
      "https://www.producthunt.com/products/fere-ai",
      "https://github.com/fere-ai",
    ],
  };

  function upsert(id, data) {
    var el = document.getElementById(id);
    if (!data) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  function hasNativeOrganization() {
    var blocks = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].id === "fere-org-jsonld") continue;
      if (blocks[i].textContent.indexOf('"Organization"') !== -1) return true;
    }
    return false;
  }

  function faqPage() {
    if (location.pathname.replace(/\/+$/, "") !== "/faq") return null;
    var items = [];
    document.querySelectorAll("details.accordion").forEach(function (item) {
      var q = item.querySelector('[data-component-part="accordion-title"]');
      var a = item.querySelector('[data-component-part="accordion-content"]');
      var question = q ? q.textContent.trim() : "";
      var answer = a ? a.textContent.replace(/\s+/g, " ").trim() : "";
      if (!question || !answer) return;
      items.push({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      });
    });
    if (!items.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://docs.fereai.xyz/faq#faq",
      url: "https://docs.fereai.xyz/faq",
      publisher: { "@id": ORG_ID },
      mainEntity: items,
    };
  }

  function run() {
    upsert("fere-org-jsonld", hasNativeOrganization() ? null : ORGANIZATION);
    upsert("fere-faq-jsonld", faqPage());
  }

  run();
  window.addEventListener("mintlify:navigate", run);
})();
