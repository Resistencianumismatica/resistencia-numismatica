/**
 * Lê categorias.json para contagens e classificações editáveis manualmente.
 */
(function () {
  "use strict";

  function resolverBase() {
    var scripts = document.querySelectorAll('script[src*="js/categorias.js"]');
    if (scripts.length) {
      var src = scripts[scripts.length - 1].getAttribute("src") || "";
      var idx = src.lastIndexOf("js/");
      if (idx !== -1) return src.slice(0, idx);
    }
    return "";
  }

  var basePath = resolverBase();

  fetch(basePath + "categorias.json")
    .then(function (r) {
      if (!r.ok) return null;
      return r.json();
    })
    .then(function (data) {
      if (!data || !data.artigos) return;

      var contagens = {};
      data.artigos.forEach(function (a) {
        var slug = a.categoria_slug || "diversos";
        contagens[slug] = (contagens[slug] || 0) + 1;
      });

      document.querySelectorAll(".categoria-link[data-categoria-slug]").forEach(function (link) {
        var slug = link.getAttribute("data-categoria-slug");
        var el = link.querySelector(".categoria-contagem");
        if (el && contagens[slug] !== undefined) {
          el.textContent = contagens[slug];
          if (contagens[slug] === 0) {
            link.classList.add("is-empty");
          } else {
            link.classList.remove("is-empty");
          }
        }
      });

      var artigo = document.querySelector(".artigo-categoria");
      if (artigo) {
        var pagina = window.location.pathname.split("/").pop();
        var match = data.artigos.find(function (a) {
          return a.ficheiro === pagina;
        });
        if (match) {
          artigo.textContent = match.categoria;
          artigo.href =
            basePath + "categorias/" + match.categoria_slug + "/index.html";
        }
      }
    })
    .catch(function () {});

})();
