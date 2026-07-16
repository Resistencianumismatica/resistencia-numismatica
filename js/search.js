/**
 * Pesquisa local — Resistência Numismática
 */
(function () {
  "use strict";

  var input = document.getElementById("search-input");
  var resultsBox = document.getElementById("search-results");
  if (!input || !resultsBox) return;

  var indice = [];
  var carregado = false;
  var basePath = resolverBase();

  function resolverBase() {
    var scripts = document.querySelectorAll('script[src*="js/search.js"]');
    if (scripts.length) {
      var src = scripts[scripts.length - 1].getAttribute("src") || "";
      var idx = src.lastIndexOf("js/");
      if (idx !== -1) return src.slice(0, idx);
    }
    return "";
  }

  function carregarIndice() {
    if (carregado) return Promise.resolve(indice);
    return fetch(basePath + "js/search-index.json")
      .then(function (r) {
        if (!r.ok) throw new Error("Indice nao encontrado");
        return r.json();
      })
      .then(function (data) {
        indice = data;
        carregado = true;
        return indice;
      })
      .catch(function () {
        indice = [];
        carregado = true;
        return indice;
      });
  }

  function normalizar(texto) {
    return (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function escaparHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function camposPesquisa(item) {
    return [
      item.titulo,
      item.data,
      item.texto,
      item.categoria,
      item.excerto,
      item.ano,
      item.mes,
      item.palavras_chave,
      item.tipologias,
    ]
      .map(normalizar)
      .join(" ");
  }

  function pesquisar(consulta) {
    if (!consulta || consulta.length < 2) {
      resultsBox.hidden = true;
      resultsBox.innerHTML = "";
      return;
    }

    var termo = normalizar(consulta);
    var resultados = indice.filter(function (item) {
      return camposPesquisa(item).indexOf(termo) !== -1;
    });

    resultados = resultados.slice(0, 12);
    renderizar(resultados, consulta);
  }

  function renderizar(resultados, consulta) {
    resultsBox.hidden = false;
    if (resultados.length === 0) {
      resultsBox.innerHTML =
        '<p class="search-sem-resultados">Nenhum resultado para «' +
        escaparHtml(consulta) +
        "»</p>";
      return;
    }

    var html = "";
    resultados.forEach(function (item) {
      var titulo = item.titulo || item.data;
      var thumb = item.miniatura
        ? '<img class="search-result-thumb" src="' +
          basePath +
          escaparHtml(item.miniatura) +
          '" alt="" loading="lazy">'
        : '<div class="search-result-thumb"></div>';
      html +=
        '<a class="search-result-item" href="' +
        basePath +
        escaparHtml(item.url) +
        '">' +
        thumb +
        '<div>' +
        '<span class="search-result-data">' +
        escaparHtml(item.data) +
        " · " +
        escaparHtml(item.categoria || "") +
        "</span>" +
        '<span class="search-result-titulo">' +
        escaparHtml(titulo) +
        "</span>" +
        (item.excerto
          ? '<span class="search-result-excerto">' +
            escaparHtml(item.excerto) +
            "</span>"
          : "") +
        "</div></a>";
    });
    resultsBox.innerHTML = html;
  }

  var debounceTimer;
  input.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      carregarIndice().then(function () {
        pesquisar(input.value.trim());
      });
    }, 200);
  });

  input.addEventListener("focus", function () {
    carregarIndice().then(function () {
      if (input.value.trim().length >= 2) pesquisar(input.value.trim());
    });
  });

  document.addEventListener("click", function (e) {
    if (!resultsBox.contains(e.target) && e.target !== input) {
      resultsBox.hidden = true;
    }
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      resultsBox.hidden = true;
      input.blur();
    }
  });
})();
