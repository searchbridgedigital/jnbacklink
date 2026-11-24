/* JN Backlink — Tools logic (shared). Vanilla JS, no libraries.
   All tools run entirely in the browser; nothing is uploaded. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function linesOf(el) {
    return (el.value || "").split(/\r?\n/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
  }
  function setText(el, text) { if (el) el.textContent = text; }
  function emptyMsg(el, msg) { if (el) el.textContent = msg || "Please enter some text above first."; }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function on(id, ev, fn) { var el = $(id); if (el) el.addEventListener(ev, fn); }
  function copyFrom(id, btn) {
    var el = $(id);
    if (!el) return;
    var text = el.value !== undefined && el.tagName === "TEXTAREA" ? el.value : el.textContent;
    if (!text || !text.trim()) { if (btn) { var o = btn.textContent; btn.textContent = "Nothing to copy"; setTimeout(function () { btn.textContent = o; }, 1500); } return; }
    window.jnCopy(text, btn);
  }
  function bindCopyClearExample(copyId, outId, clearIds, exampleFn) {
    if (copyId) on(copyId, "click", function (e) { copyFrom(outId, e.currentTarget); });
    if (clearIds) clearIds.forEach(function (cid) {
      on(cid, "click", function () {
        (Array.isArray(outId) ? outId : [outId]).forEach(function (oid) { var el = $(oid); if (el) { if (el.tagName === "TEXTAREA") el.value = ""; else el.textContent = ""; } });
      });
    });
  }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  }
  function downloadBlob(blob, filename) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- URL to HTML / BBCode Converter ---------- */
    if ($("urlHtmlInput")) {
      on("urlHtmlConvert", "click", function () {
        var urls = linesOf($("urlHtmlInput"));
        var text = ($("urlHtmlText") ? $("urlHtmlText").value.trim() : "") || "";
        if (!urls.length) { emptyMsg($("htmlOutput")); emptyMsg($("bbcodeOutput")); return; }
        var html = [], bb = [];
        urls.forEach(function (u) {
          var href = /^https?:\/\//i.test(u) ? u : "https://" + u;
          var label = text || u;
          html.push('<a href="' + esc(href) + '">' + esc(label) + "</a>");
          bb.push("[url=" + href + "]" + label + "[/url]");
        });
        setText($("htmlOutput"), html.join("\n"));
        setText($("bbcodeOutput"), bb.join("\n"));
      });
      on("urlHtmlExample", "click", function () { $("urlHtmlInput").value = "https://jnbacklink.com\nhttps://example.com/blog"; if ($("urlHtmlText")) $("urlHtmlText").value = "JN Backlink"; $("urlHtmlConvert").click(); });
      on("urlHtmlClear", "click", function () { $("urlHtmlInput").value = ""; if ($("urlHtmlText")) $("urlHtmlText").value = ""; setText($("htmlOutput"), ""); setText($("bbcodeOutput"), ""); });
      on("copyHtml", "click", function (e) { copyFrom("htmlOutput", e.currentTarget); });
      on("copyBbcode", "click", function (e) { copyFrom("bbcodeOutput", e.currentTarget); });
    }

    /* ---------- Duplicate Link Checker ---------- */
    if ($("dupInput")) {
      on("dupCheck", "click", function () {
        var urls = linesOf($("dupInput"));
        if (!urls.length) { emptyMsg($("dupUniqueOutput")); setText($("dupListOutput"), ""); ["dupTotal", "dupUnique", "dupCount"].forEach(function (i) { setText($(i), "0"); }); return; }
        var seen = {}, unique = [], dups = [];
        urls.forEach(function (u) { if (seen[u]) { if (dups.indexOf(u) === -1) dups.push(u); } else { seen[u] = true; unique.push(u); } });
        setText($("dupTotal"), String(urls.length));
        setText($("dupUnique"), String(unique.length));
        setText($("dupCount"), String(urls.length - unique.length));
        setText($("dupUniqueOutput"), unique.join("\n"));
        setText($("dupListOutput"), dups.length ? dups.join("\n") : "No duplicates found.");
      });
      on("dupExample", "click", function () { $("dupInput").value = "https://jnbacklink.com\nhttps://example.com\nhttps://jnbacklink.com\nhttps://example.com/blog\nhttps://example.com"; $("dupCheck").click(); });
      on("dupClear", "click", function () { $("dupInput").value = ""; setText($("dupUniqueOutput"), ""); setText($("dupListOutput"), ""); ["dupTotal", "dupUnique", "dupCount"].forEach(function (i) { setText($(i), "0"); }); });
      on("copyDupUnique", "click", function (e) { copyFrom("dupUniqueOutput", e.currentTarget); });
    }

    /* ---------- URL to Domain Converter ---------- */
    if ($("domainInput")) {
      on("domainConvert", "click", function () {
        var urls = linesOf($("domainInput"));
        if (!urls.length) { emptyMsg($("domainOutput")); return; }
        var out = [];
        urls.forEach(function (u) {
          var s = u.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").replace(/^www\./i, "");
          s = s.split(/[\/?#]/)[0].toLowerCase();
          if (s && s.indexOf(".") !== -1) out.push(s);
        });
        setText($("domainOutput"), out.length ? out.join("\n") : "No valid domains found. Enter URLs like https://example.com/page");
      });
      on("domainExample", "click", function () { $("domainInput").value = "https://www.jnbacklink.com/services/\nhttp://example.com/blog/post?id=1\nhttps://sub.domain.co.uk/page"; $("domainConvert").click(); });
      on("domainClear", "click", function () { $("domainInput").value = ""; setText($("domainOutput"), ""); });
      on("copyDomain", "click", function (e) { copyFrom("domainOutput", e.currentTarget); });
    }

    /* ---------- Update List Filter ---------- */
    if ($("filterInput")) {
      var runFilter = function () {
        var list = linesOf($("filterInput"));
        var keys = linesOf($("filterKeywords")).map(function (k) { return k.toLowerCase(); });
        if (!list.length) { emptyMsg($("filterOutput")); setText($("filterCount"), ""); return; }
        if (!keys.length) { setText($("filterOutput"), list.join("\n")); setText($("filterCount"), list.length + " line(s) kept, 0 removed (no keywords entered)."); return; }
        var mode = "include";
        document.querySelectorAll('input[name="filterMode"]').forEach(function (r) { if (r.checked) mode = r.value; });
        var kept = list.filter(function (line) {
          var hit = keys.some(function (k) { return line.toLowerCase().indexOf(k) !== -1; });
          return mode === "include" ? hit : !hit;
        });
        setText($("filterOutput"), kept.length ? kept.join("\n") : "No lines matched the filter.");
        setText($("filterCount"), kept.length + " line(s) kept, " + (list.length - kept.length) + " removed.");
      };
      on("filterRun", "click", runFilter);
      on("filterExample", "click", function () { $("filterInput").value = "https://example.com/seo-guide\nhttps://example.com/ads-tips\nhttps://example.com/seo-tools\nhttps://example.com/about"; $("filterKeywords").value = "seo"; runFilter(); });
      on("filterClear", "click", function () { $("filterInput").value = ""; $("filterKeywords").value = ""; setText($("filterOutput"), ""); setText($("filterCount"), ""); });
      on("copyFilter", "click", function (e) { copyFrom("filterOutput", e.currentTarget); });
    }

    /* ---------- Accent Remover ---------- */
    if ($("accentInput")) {
      var accentMap = { "\u0111": "d", "\u0110": "D", "\u0142": "l", "\u0141": "L", "\u00F8": "o", "\u00D8": "O", "\u00E6": "ae", "\u00C6": "AE", "\u00DF": "ss", "\u00FE": "th", "\u00DE": "Th" };
      var runAccent = function () {
        var t = $("accentInput").value;
        if (!t.trim()) { emptyMsg($("accentOutput")); return; }
        var out = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\u0111\u0110\u0142\u0141\u00F8\u00D8\u00E6\u00C6\u00DF\u00FE\u00DE]/g, function (c) { return accentMap[c] || c; });
        setText($("accentOutput"), out);
      };
      on("accentConvert", "click", runAccent);
      on("accentExample", "click", function () { $("accentInput").value = "Caf\u00E9, na\u00EFve, r\u00E9sum\u00E9, se\u00F1or, \u00FCber, fa\u00E7ade"; runAccent(); });
      on("accentClear", "click", function () { $("accentInput").value = ""; setText($("accentOutput"), ""); });
      on("copyAccent", "click", function (e) { copyFrom("accentOutput", e.currentTarget); });
    }

    /* ---------- Smart Link Converter ---------- */
    if ($("smartInput")) {
      var URL_RE = /https?:\/\/[^\s<>"')\]]+/g;
      var runSmart = function () {
        var t = $("smartInput").value;
        if (!t.trim()) { emptyMsg($("smartHtmlOutput")); emptyMsg($("smartMdOutput")); return; }
        // Split on URLs first, then escape the plain-text parts — escaping before
        // matching would corrupt URLs (the old regex also excluded the letters l/t).
        var parts = t.split(/(https?:\/\/[^\s<>"')\]]+)/g);
        var html = parts.map(function (part) {
          if (/^https?:\/\//.test(part)) return '<a href="' + esc(part) + '" target="_blank" rel="noopener">' + esc(part) + "</a>";
          return esc(part);
        }).join("");
        $("smartHtmlOutput").innerHTML = html;
        setText($("smartMdOutput"), t.replace(URL_RE, function (u) { return "[" + u + "](" + u + ")"; }));
      };
      on("smartConvert", "click", runSmart);
      on("smartExample", "click", function () { $("smartInput").value = "Visit our website at https://jnbacklink.com for SEO services and read https://example.com/blog for tips."; runSmart(); });
      on("smartClear", "click", function () { $("smartInput").value = ""; setText($("smartHtmlOutput"), ""); setText($("smartMdOutput"), ""); });
      on("copySmartHtml", "click", function (e) { var html = $("smartInput").value.replace(URL_RE, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u + "</a>"; }); window.jnCopy(html, e.currentTarget); });
      on("copySmartMd", "click", function (e) { copyFrom("smartMdOutput", e.currentTarget); });
    }

    /* ---------- Link Distributor ---------- */
    if ($("distInput")) {
      var runDist = function () {
        var list = linesOf($("distInput"));
        var n = parseInt(($("distGroups") || {}).value, 10);
        if (!list.length) { emptyMsg($("distOutput")); return; }
        if (!n || n < 1) n = 2;
        if (n > list.length) n = list.length;
        var size = Math.ceil(list.length / n), out = [];
        for (var g = 0; g < n; g++) {
          var chunk = list.slice(g * size, (g + 1) * size);
          if (!chunk.length) break;
          out.push("Group " + (g + 1) + " (" + chunk.length + "):");
          out = out.concat(chunk);
          out.push("");
        }
        setText($("distOutput"), out.join("\n").trim());
      };
      on("distRun", "click", runDist);
      on("distExample", "click", function () { $("distInput").value = "https://example.com/1\nhttps://example.com/2\nhttps://example.com/3\nhttps://example.com/4\nhttps://example.com/5\nhttps://example.com/6"; if ($("distGroups")) $("distGroups").value = "3"; runDist(); });
      on("distClear", "click", function () { $("distInput").value = ""; setText($("distOutput"), ""); });
      on("copyDist", "click", function (e) { copyFrom("distOutput", e.currentTarget); });
    }

    /* ---------- Random Link Mixer ---------- */
    if ($("mixInput")) {
      var runMix = function () {
        var list = linesOf($("mixInput"));
        if (!list.length) { emptyMsg($("mixOutput")); return; }
        setText($("mixOutput"), shuffle(list.slice()).join("\n"));
      };
      on("mixRun", "click", runMix);
      on("mixExample", "click", function () { $("mixInput").value = "https://example.com/a\nhttps://example.com/b\nhttps://example.com/c\nhttps://example.com/d\nhttps://example.com/e"; runMix(); });
      on("mixClear", "click", function () { $("mixInput").value = ""; setText($("mixOutput"), ""); });
      on("copyMix", "click", function (e) { copyFrom("mixOutput", e.currentTarget); });
    }

    /* ---------- Shared image-tool handling ---------- */
    function setupImageTool(cfg) {
      var fileInput = $(cfg.file), zone = $(cfg.zone), preview = $(cfg.preview);
      if (!fileInput) return null;
      var state = { img: null, name: "image", type: "image/png", width: 0, height: 0, size: 0 };
      function loadFile(file) {
        if (!file || file.type.indexOf("image/") !== 0) { if (cfg.msg) setText($(cfg.msg), "Please choose an image file (PNG, JPG, WebP, etc.)."); return; }
        var reader = new FileReader();
        reader.onload = function (e) {
          var img = new Image();
          img.onload = function () {
            state.img = img; state.name = file.name.replace(/\.[^.]+$/, "") || "image";
            state.type = file.type || "image/png"; state.width = img.naturalWidth; state.height = img.naturalHeight; state.size = file.size;
            if (preview) { preview.src = e.target.result; preview.style.display = "block"; }
            if (cfg.onLoad) cfg.onLoad(state);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
      fileInput.addEventListener("change", function () { loadFile(fileInput.files[0]); });
      if (zone) {
        zone.addEventListener("click", function () { fileInput.click(); });
        ["dragover", "dragenter"].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add("drag"); }); });
        ["dragleave", "drop"].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove("drag"); }); });
        zone.addEventListener("drop", function (e) { if (e.dataTransfer.files.length) loadFile(e.dataTransfer.files[0]); });
      }
      return state;
    }
    function canvasToBlobDownload(canvas, mime, quality, filename, btn) {
      canvas.toBlob(function (blob) {
        if (!blob) return;
        downloadBlob(blob, filename);
        if (btn) { var o = btn.textContent; btn.textContent = "Downloaded!"; setTimeout(function () { btn.textContent = o; }, 1600); }
      }, mime, quality);
    }

    /* ---------- Image to Logo ---------- */
    if ($("logoFile")) {
      var logo = setupImageTool({ file: "logoFile", zone: "logoZone", preview: "logoPreview", msg: "logoMsg" });
      on("logoRun", "click", function () {
        if (!logo.img) { setText($("logoMsg"), "Please upload an image first."); return; }
        var size = parseInt(($("logoSize") || {}).value, 10) || 512;
        var c = document.createElement("canvas"); c.width = size; c.height = size;
        var ctx = c.getContext("2d");
        var scale = Math.min(size / logo.width, size / logo.height);
        var w = logo.width * scale, h = logo.height * scale;
        ctx.drawImage(logo.img, (size - w) / 2, (size - h) / 2, w, h);
        var url = c.toDataURL("image/png");
        var p = $("logoPreview"); if (p) { p.src = url; p.style.display = "block"; }
        setText($("logoMsg"), "Logo ready: " + size + " x " + size + " px PNG with transparent padding.");
        $("logoRun")._canvas = c;
      });
      on("logoDownload", "click", function (e) {
        var c = $("logoRun")._canvas;
        if (!c) { setText($("logoMsg"), "Click \u201CMake Logo\u201D first."); return; }
        var size = parseInt(($("logoSize") || {}).value, 10) || 512;
        canvasToBlobDownload(c, "image/png", 1, (logo.name || "logo") + "-" + size + ".png", e.currentTarget);
      });
    }

    /* ---------- Image Resizer ---------- */
    if ($("resizeFile")) {
      var rz = setupImageTool({ file: "resizeFile", zone: "resizeZone", preview: "resizePreview", msg: "resizeMsg",
        onLoad: function (s) { if ($("resizeWidth")) $("resizeWidth").value = s.width; if ($("resizeHeight")) $("resizeHeight").value = s.height; setText($("resizeMsg"), "Original: " + s.width + " x " + s.height + " px."); } });
      on("resizeWidth", "input", function () {
        if ($("resizeKeep") && $("resizeKeep").checked && rz.img) { $("resizeHeight").value = Math.round($("resizeWidth").value * rz.height / rz.width) || ""; }
      });
      on("resizeHeight", "input", function () {
        if ($("resizeKeep") && $("resizeKeep").checked && rz.img) { $("resizeWidth").value = Math.round($("resizeHeight").value * rz.width / rz.height) || ""; }
      });
      on("resizeRun", "click", function () {
        if (!rz.img) { setText($("resizeMsg"), "Please upload an image first."); return; }
        var w = parseInt(($("resizeWidth") || {}).value, 10), h = parseInt(($("resizeHeight") || {}).value, 10);
        if (!w || !h || w < 1 || h < 1) { setText($("resizeMsg"), "Please enter a valid width and height (at least 1 px)."); return; }
        var c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(rz.img, 0, 0, w, h);
        var p = $("resizePreview"); if (p) { p.src = c.toDataURL(rz.type); p.style.display = "block"; }
        setText($("resizeMsg"), "Resized to " + w + " x " + h + " px.");
        $("resizeRun")._canvas = c;
      });
      on("resizeDownload", "click", function (e) {
        var c = $("resizeRun")._canvas;
        if (!c) { setText($("resizeMsg"), "Click \u201CResize Image\u201D first."); return; }
        var ext = rz.type === "image/jpeg" ? "jpg" : rz.type === "image/webp" ? "webp" : "png";
        canvasToBlobDownload(c, rz.type, 0.92, (rz.name || "image") + "-resized." + ext, e.currentTarget);
      });
    }

    /* ---------- Image Converter ---------- */
    if ($("convFile")) {
      var cv = setupImageTool({ file: "convFile", zone: "convZone", preview: "convPreview", msg: "convMsg" });
      on("convRun", "click", function () {
        if (!cv.img) { setText($("convMsg"), "Please upload an image first."); return; }
        var fmt = ($("convFormat") || {}).value || "image/png";
        var c = document.createElement("canvas"); c.width = cv.width; c.height = cv.height;
        var ctx = c.getContext("2d");
        if (fmt === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height); }
        ctx.drawImage(cv.img, 0, 0);
        var p = $("convPreview"); if (p) { p.src = c.toDataURL(fmt, 0.92); p.style.display = "block"; }
        var label = fmt === "image/png" ? "PNG" : fmt === "image/jpeg" ? "JPEG" : "WebP";
        setText($("convMsg"), "Converted to " + label + " (" + cv.width + " x " + cv.height + " px).");
        $("convRun")._canvas = c; $("convRun")._fmt = fmt;
      });
      on("convDownload", "click", function (e) {
        var c = $("convRun")._canvas;
        if (!c) { setText($("convMsg"), "Click \u201CConvert Image\u201D first."); return; }
        var fmt = $("convRun")._fmt || "image/png";
        var ext = fmt === "image/jpeg" ? "jpg" : fmt === "image/webp" ? "webp" : "png";
        canvasToBlobDownload(c, fmt, 0.92, (cv.name || "image") + "-converted." + ext, e.currentTarget);
      });
    }

    /* ---------- Image Compressor ---------- */
    if ($("compFile")) {
      var cp = setupImageTool({ file: "compFile", zone: "compZone", preview: "compPreview", msg: "compMsg",
        onLoad: function (s) { setText($("compOrig"), "Original: " + (s.size / 1024).toFixed(1) + " KB (" + s.width + " x " + s.height + " px)"); setText($("compNew"), ""); } });
      var qLabel = $("compQualityVal");
      on("compQuality", "input", function () { if (qLabel) qLabel.textContent = $("compQuality").value + "%"; });
      on("compRun", "click", function () {
        if (!cp.img) { setText($("compMsg"), "Please upload an image first."); return; }
        var q = (parseInt(($("compQuality") || {}).value, 10) || 80) / 100;
        var mime = cp.type === "image/png" ? "image/png" : cp.type;
        var c = document.createElement("canvas"); c.width = cp.width; c.height = cp.height;
        var ctx = c.getContext("2d");
        if (mime === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height); }
        ctx.drawImage(cp.img, 0, 0);
        c.toBlob(function (blob) {
          if (!blob) return;
          var p = $("compPreview"); if (p) { p.src = URL.createObjectURL(blob); p.style.display = "block"; }
          var kb = (blob.size / 1024).toFixed(1);
          var origKb = (cp.size / 1024).toFixed(1);
          var saved = cp.size > 0 ? Math.max(0, Math.round((1 - blob.size / cp.size) * 100)) : 0;
          setText($("compNew"), "Compressed: " + kb + " KB (" + saved + "% smaller)");
          setText($("compMsg"), "Compressed from " + origKb + " KB to " + kb + " KB at " + Math.round(q * 100) + "% quality." + (mime === "image/png" ? " Note: PNG is lossless, so quality affects JPEG/WebP most." : ""));
          $("compRun")._blob = blob; $("compRun")._mime = mime;
        }, mime, q);
      });
      on("compDownload", "click", function (e) {
        var blob = $("compRun")._blob;
        if (!blob) { setText($("compMsg"), "Click \u201CCompress Image\u201D first."); return; }
        var mime = $("compRun")._mime || "image/jpeg";
        var ext = mime === "image/jpeg" ? "jpg" : mime === "image/webp" ? "webp" : "png";
        downloadBlob(blob, (cp.name || "image") + "-compressed." + ext);
        var o = e.currentTarget.textContent; e.currentTarget.textContent = "Downloaded!"; setTimeout(function () { e.currentTarget.textContent = o; }, 1600);
      });
    }

    /* ---------- Word Counter (live) ---------- */
    if ($("wcInput")) {
      var runWc = function () {
        var t = $("wcInput").value;
        var words = t.trim() ? t.trim().split(/\s+/).length : 0;
        var sentences = t.trim() ? t.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; }).length : 0;
        var paras = t.trim() ? t.split(/\n+/).filter(function (s) { return s.trim().length > 0; }).length : 0;
        setText($("wcWords"), String(words));
        setText($("wcChars"), String(t.length));
        setText($("wcCharsNoSpaces"), String(t.replace(/\s/g, "").length));
        setText($("wcSentences"), String(sentences));
        setText($("wcParas"), String(paras));
        setText($("wcReading"), words ? Math.max(1, Math.ceil(words / 200)) + " min" : "0 min");
      };
      $("wcInput").addEventListener("input", runWc); runWc();
      on("wcExample", "click", function () { $("wcInput").value = "SEO helps your website rank higher on Google.\n\nMore visibility means more traffic, more leads and more sales."; runWc(); });
      on("wcClear", "click", function () { $("wcInput").value = ""; runWc(); });
      on("copyWc", "click", function (e) { window.jnCopy($("wcInput").value, e.currentTarget); });
    }

    /* ---------- Text Case Converter ---------- */
    if ($("caseInput")) {
      var titleCase = function (s) { return s.toLowerCase().replace(/(^|\s|[-(["'])(\S)/g, function (m) { return m.toUpperCase(); }); };
      var sentenceCase = function (s) {
        return s.toLowerCase().replace(/(^\s*[a-z]|[.!?]\s+[a-z])/g, function (m) { return m.toUpperCase(); });
      };
      document.querySelectorAll("[data-case]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var t = $("caseInput").value;
          if (!t.trim()) { emptyMsg($("caseOutput")); return; }
          var mode = btn.getAttribute("data-case"), out = t;
          if (mode === "upper") out = t.toUpperCase();
          else if (mode === "lower") out = t.toLowerCase();
          else if (mode === "title") out = titleCase(t);
          else if (mode === "sentence") out = sentenceCase(t);
          else if (mode === "capitalize") out = t.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
          else if (mode === "toggle") out = t.split("").map(function (c) { return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase(); }).join("");
          setText($("caseOutput"), out);
        });
      });
      on("caseExample", "click", function () { $("caseInput").value = "hello world. this is a sample text for jn backlink."; setText($("caseOutput"), ""); });
      on("caseClear", "click", function () { $("caseInput").value = ""; setText($("caseOutput"), ""); });
      on("copyCase", "click", function (e) { copyFrom("caseOutput", e.currentTarget); });
    }

    /* ---------- Lorem Ipsum Generator ---------- */
    if ($("loremParas")) {
      var LOREM = ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.", "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", "Curabitur pretium tincidunt lacus, nulla gravida orci a odio.", "Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.", "Integer in mauris eu nibh euismod gravida.", "Duis ac tellus et risus vulputate vehicula.", "Donec lobortis risus a elit, etiam tempor.", "Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam.", "Maecenas fermentum consequat mi, donec fermentum.", "Pellentesque malesuada nulla a mi, duis sapien sem, aliquet nec, commodo eget, consequat quis, neque.", "Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat.", "Cras mollis scelerisque nunc, nullam arcu justo, malesuada vel, tempor at, tincidunt eget, nunc."];
      on("loremRun", "click", function () {
        var paras = Math.max(1, Math.min(20, parseInt($("loremParas").value, 10) || 3));
        var wordsPer = Math.max(10, parseInt(($("loremWords") || {}).value, 10) || 50);
        var out = [], si = 0;
        for (var p = 0; p < paras; p++) {
          var para = "", count = 0;
          while (count < wordsPer) { var s = LOREM[si % LOREM.length]; si++; para += (para ? " " : "") + s; count += s.split(/\s+/).length; }
          out.push(para);
        }
        setText($("loremOutput"), out.join("\n\n"));
      });
      on("loremClear", "click", function () { setText($("loremOutput"), ""); });
      on("copyLorem", "click", function (e) { copyFrom("loremOutput", e.currentTarget); });
    }

    /* ---------- Remove Duplicate Lines ---------- */
    if ($("dedupInput")) {
      on("dedupRun", "click", function () {
        var raw = ($("dedupInput").value || "").split(/\r?\n/);
        var nonEmpty = raw.filter(function (s) { return s.trim().length > 0; });
        if (!nonEmpty.length) { emptyMsg($("dedupOutput")); setText($("dedupCount"), ""); return; }
        var seen = {}, out = [];
        nonEmpty.forEach(function (s) { var k = s.trim(); if (!seen[k]) { seen[k] = true; out.push(k); } });
        setText($("dedupOutput"), out.join("\n"));
        setText($("dedupCount"), (nonEmpty.length - out.length) + " duplicate line(s) removed. " + out.length + " unique line(s) kept.");
      });
      on("dedupExample", "click", function () { $("dedupInput").value = "apple\nbanana\napple\norange\nbanana\ngrape"; $("dedupRun").click(); });
      on("dedupClear", "click", function () { $("dedupInput").value = ""; setText($("dedupOutput"), ""); setText($("dedupCount"), ""); });
      on("copyDedup", "click", function (e) { copyFrom("dedupOutput", e.currentTarget); });
    }

    /* ---------- Sort Lines ---------- */
    if ($("sortInput")) {
      document.querySelectorAll("[data-sort]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var list = linesOf($("sortInput"));
          if (!list.length) { emptyMsg($("sortOutput")); return; }
          var mode = btn.getAttribute("data-sort"), out = list.slice();
          if (mode === "az") out.sort(function (a, b) { return a.localeCompare(b); });
          else if (mode === "za") out.sort(function (a, b) { return b.localeCompare(a); });
          else if (mode === "length") out.sort(function (a, b) { return a.length - b.length; });
          else if (mode === "reverse") out.reverse();
          else if (mode === "shuffle") shuffle(out);
          setText($("sortOutput"), out.join("\n"));
        });
      });
      on("sortExample", "click", function () { $("sortInput").value = "banana\napple\ncherry\ndate"; setText($("sortOutput"), ""); });
      on("sortClear", "click", function () { $("sortInput").value = ""; setText($("sortOutput"), ""); });
      on("copySort", "click", function (e) { copyFrom("sortOutput", e.currentTarget); });
    }

    /* ---------- Text Reverser ---------- */
    if ($("revInput")) {
      document.querySelectorAll("[data-rev]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var t = $("revInput").value;
          if (!t.trim()) { emptyMsg($("revOutput")); return; }
          var mode = btn.getAttribute("data-rev"), out = "";
          if (mode === "whole") out = Array.from(t).reverse().join("");
          else if (mode === "lines") out = t.split(/\r?\n/).map(function (l) { return Array.from(l).reverse().join(""); }).join("\n");
          else if (mode === "words") out = t.split(/\s+/).reverse().join(" ");
          setText($("revOutput"), out);
        });
      });
      on("revExample", "click", function () { $("revInput").value = "Hello World\nJN Backlink"; setText($("revOutput"), ""); });
      on("revClear", "click", function () { $("revInput").value = ""; setText($("revOutput"), ""); });
      on("copyRev", "click", function (e) { copyFrom("revOutput", e.currentTarget); });
    }

    /* ---------- Find and Replace ---------- */
    if ($("frInput")) {
      on("frRun", "click", function () {
        var t = $("frInput").value, find = $("frFind").value, rep = $("frReplace").value || "";
        if (!t.trim()) { emptyMsg($("frOutput")); setText($("frCount"), ""); return; }
        if (!find) { setText($("frOutput"), t); setText($("frCount"), "Enter text to find first."); return; }
        var cs = $("frCase") && $("frCase").checked;
        var escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        var re = new RegExp(escaped, cs ? "g" : "gi");
        var count = (t.match(re) || []).length;
        setText($("frOutput"), t.replace(re, rep));
        setText($("frCount"), count + " replacement(s) made.");
      });
      on("frExample", "click", function () { $("frInput").value = "SEO is important. Good SEO helps your website rank higher on Google."; $("frFind").value = "SEO"; $("frReplace").value = "Search Engine Optimization"; $("frRun").click(); });
      on("frClear", "click", function () { $("frInput").value = ""; $("frFind").value = ""; $("frReplace").value = ""; setText($("frOutput"), ""); setText($("frCount"), ""); });
      on("copyFr", "click", function (e) { copyFrom("frOutput", e.currentTarget); });
    }

  });
})();
