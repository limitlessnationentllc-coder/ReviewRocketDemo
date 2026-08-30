/**
 * Legacy Engine — shared funnel controller
 *
 * Drives the personalization micro-form -> AI cover preview -> email
 * capture -> $25 refundable reservation upsell flow for both verticals.
 * Vertical-specific copy lives in each vertical's index.html; this file
 * only needs a `window.LE_CONFIG` object and the standard `.le-step`
 * markup (see /legacy-engine/collector-car/index.html for reference).
 */
(function (window, document) {
  "use strict";

  var STEP_ORDER = ["form", "generating", "preview", "email", "upsell"];

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function showStep(root, name) {
    $all(".le-step", root).forEach(function (el) {
      el.classList.toggle("is-active", el.getAttribute("data-step") === name);
    });
    var idx = STEP_ORDER.indexOf(name);
    $all(".le-progress span", root).forEach(function (dot, i) {
      dot.classList.toggle("is-done", i < idx);
      dot.classList.toggle("is-active", i === idx);
    });
  }

  function showError(root, message) {
    var el = $(".le-error", root);
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-visible");
  }
  function clearError(root) {
    var el = $(".le-error", root);
    if (!el) return;
    el.textContent = "";
    el.classList.remove("is-visible");
  }

  function readFileAsResizedDataUrl(file, maxDim) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () {
        var img = new Image();
        img.onerror = reject;
        img.onload = function () {
          var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          var w = Math.round(img.width * scale);
          var h = Math.round(img.height * scale);
          var canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  function drawImageCover(ctx, img, x, y, w, h) {
    var imgRatio = img.width / img.height;
    var boxRatio = w / h;
    var sx, sy, sw, sh;
    if (imgRatio > boxRatio) {
      sh = img.height;
      sw = sh * boxRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = sw / boxRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    var words = (text || "").split(/\s+/).filter(Boolean);
    var line = "";
    var lines = [];
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
        if (lines.length === maxLines - 1) break;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    if (lines.length === maxLines && words.length > lines.join(" ").split(/\s+/).length) {
      lines[lines.length - 1] = lines[lines.length - 1].replace(/[.,;:]*$/, "") + "…";
    }
    lines.forEach(function (l, i) {
      ctx.fillText(l, x, y + i * lineHeight);
    });
    return lines.length * lineHeight;
  }

  async function renderCover(canvas, opts) {
    var W = 1024,
      H = 1536;
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");

    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {}
    }

    var bg = await loadImage(opts.backgroundImage);
    drawImageCover(ctx, bg, 0, 0, W, H);

    var grad = ctx.createLinearGradient(0, H * 0.56, 0, H);
    grad.addColorStop(0, "rgba(11,29,46,0)");
    grad.addColorStop(1, "rgba(11,29,46,0.94)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, H * 0.56, W, H * 0.44);

    // Brand badge
    ctx.fillStyle = "rgba(245,241,232,0.9)";
    ctx.font = "600 22px Inter, sans-serif";
    ctx.fillText("L E G A C Y   E N G I N E", 48, 64);

    // Photo inset
    if (opts.photoDataUrl) {
      try {
        var photo = await loadImage(opts.photoDataUrl);
        var boxW = 600,
          boxH = 600,
          boxX = (W - boxW) / 2,
          boxY = 210;
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.45)";
        ctx.shadowBlur = 40;
        roundedRectPath(ctx, boxX, boxY, boxW, boxH, 20);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.restore();
        ctx.save();
        roundedRectPath(ctx, boxX + 8, boxY + 8, boxW - 16, boxH - 16, 16);
        ctx.clip();
        drawImageCover(ctx, photo, boxX + 8, boxY + 8, boxW - 16, boxH - 16);
        ctx.restore();
      } catch (e) {
        /* photo failed to decode — continue without it */
      }
    }

    var textX = 64;
    var cursorY = H * 0.68;

    ctx.fillStyle = "#f5f1e8";
    ctx.font = "700 58px 'Playfair Display', Georgia, serif";
    cursorY += wrapText(ctx, opts.itemName || "Untitled Legacy", textX, cursorY, W - 128, 62, 2);

    cursorY += 20;
    ctx.fillStyle = "#e4c878";
    ctx.font = "600 30px Inter, sans-serif";
    var meta = [opts.year, opts.ownerName].filter(Boolean).join("  •  ");
    ctx.fillText(meta, textX, cursorY);

    cursorY += 46;
    ctx.fillStyle = "rgba(245,241,232,0.88)";
    ctx.font = "italic 27px Inter, sans-serif";
    wrapText(ctx, '“' + (opts.memory || "") + '”', textX, cursorY, W - 128, 34, 3);

    ctx.fillStyle = "rgba(228,200,120,0.85)";
    ctx.font = "600 18px Inter, sans-serif";
    ctx.fillText("HANDCRAFTED KEEPSAKE PREVIEW", textX, H - 48);
  }

  function init(userConfig) {
    var root = userConfig.root ? $(userConfig.root) : document;
    var vertical = userConfig.vertical;
    var state = {
      photoDataUrl: null,
      backgroundImage: null,
      aiGenerated: false,
      personalization: {},
      email: null,
    };
    var formStarted = false;

    var form = $("#le-personalize-form", root);
    var photoInput = $("#le-photo-input", root);
    var photoPreview = $("#le-photo-preview", root);
    var emailForm = $("#le-email-form", root);
    var checkoutBtn = $("#le-checkout-btn", root);
    var previewContinueBtn = $("#le-preview-continue", root);
    var canvas = $("#le-cover-canvas", root);

    window.LegacyEngine.trackPageViewAndAdClick(vertical);
    showStep(root, "form");

    function markFormStarted() {
      if (formStarted) return;
      formStarted = true;
      window.LegacyEngine.track("form_start", {}, vertical);
    }

    if (form) {
      $all("input, textarea", form).forEach(function (el) {
        el.addEventListener("focus", markFormStarted, { once: false });
      });
    }

    if (photoInput) {
      photoInput.addEventListener("change", function () {
        var file = photoInput.files && photoInput.files[0];
        if (!file) return;
        markFormStarted();
        readFileAsResizedDataUrl(file, 900).then(function (dataUrl) {
          state.photoDataUrl = dataUrl;
          if (photoPreview) {
            photoPreview.innerHTML = "";
            var img = document.createElement("img");
            img.src = dataUrl;
            photoPreview.appendChild(img);
          }
        });
      });
    }

    if (form) {
      form.addEventListener("submit", function (evt) {
        evt.preventDefault();
        clearError(root);

        var data = new FormData(form);
        var itemName = (data.get("itemName") || "").toString().trim();
        var year = (data.get("year") || "").toString().trim();
        var ownerName = (data.get("ownerName") || "").toString().trim();
        var memory = (data.get("memory") || "").toString().trim();

        if (!itemName || !year || !ownerName || !memory) {
          showError(root, "Please fill in every field so we can personalize your preview.");
          return;
        }

        state.personalization = { itemName: itemName, year: year, ownerName: ownerName, memory: memory };

        window.LegacyEngine.track(
          "form_complete",
          {
            item_name: itemName,
            year: year,
            has_photo: Boolean(state.photoDataUrl),
            memory_length: memory.length,
          },
          vertical
        );

        showStep(root, "generating");

        fetch("/api/legacy-engine/generate-cover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vertical: vertical, itemName: itemName, year: year, memory: memory }),
        })
          .then(function (r) {
            return r.json();
          })
          .then(function (json) {
            if (!json || !json.ok) throw new Error("cover generation failed");
            state.backgroundImage = json.backgroundImage;
            state.aiGenerated = Boolean(json.aiGenerated);
            return renderCover(canvas, {
              backgroundImage: json.backgroundImage,
              photoDataUrl: state.photoDataUrl,
              itemName: itemName,
              year: year,
              ownerName: ownerName,
              memory: memory,
            });
          })
          .then(function () {
            window.LegacyEngine.track("cover_generated", { ai_generated: state.aiGenerated }, vertical);
            showStep(root, "preview");
          })
          .catch(function (err) {
            console.error(err);
            showStep(root, "form");
            showError(root, "We couldn't generate your preview just now — please try again.");
          });
      });
    }

    if (previewContinueBtn) {
      previewContinueBtn.addEventListener("click", function () {
        showStep(root, "email");
      });
    }

    if (emailForm) {
      emailForm.addEventListener("submit", function (evt) {
        evt.preventDefault();
        clearError(root);
        var data = new FormData(emailForm);
        var email = (data.get("email") || "").toString().trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showError(root, "Please enter a valid email address.");
          return;
        }
        state.email = email;
        var submitBtn = emailForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        fetch("/api/legacy-engine/capture-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            vertical: vertical,
            session_id: window.LegacyEngine.getSessionId(),
            personalization: state.personalization,
          }),
        })
          .catch(function () {})
          .then(function () {
            window.LegacyEngine.track("email_captured", {}, vertical);
            showStep(root, "upsell");
          })
          .finally(function () {
            if (submitBtn) submitBtn.disabled = false;
          });
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function () {
        clearError(root);
        window.LegacyEngine.track("checkout_start", {}, vertical);

        // Optional direct Stripe Payment Link override (set via
        // LegacyEngineFunnel.init({ stripeLink: "https://buy.stripe.com/..." })).
        // When present, skips the dynamic create-checkout-session API and
        // sends the visitor straight to the live payment page.
        if (userConfig.stripeLink) {
          try {
            window.sessionStorage.setItem(
              "le_pending_reservation_" + vertical,
              JSON.stringify({
                email: state.email,
                personalization: state.personalization,
                session_id: window.LegacyEngine.getSessionId(),
              })
            );
          } catch (e) {}
          window.open(userConfig.stripeLink, "_blank", "noopener");
          return;
        }

        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<span class="le-spinner"></span> Redirecting to secure checkout…';

        fetch("/api/legacy-engine/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: state.email,
            vertical: vertical,
            session_id: window.LegacyEngine.getSessionId(),
            personalization: state.personalization,
          }),
        })
          .then(function (r) {
            return r.json();
          })
          .then(function (json) {
            if (json && json.ok && json.url) {
              try {
                window.sessionStorage.setItem(
                  "le_pending_reservation_" + vertical,
                  JSON.stringify({
                    email: state.email,
                    personalization: state.personalization,
                    session_id: window.LegacyEngine.getSessionId(),
                  })
                );
              } catch (e) {}
              window.location.href = json.url;
              return;
            }
            throw new Error(
              (json && json.message) || "Something went wrong starting checkout. Please try again."
            );
          })
          .catch(function (err) {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = "Reserve my Legacy Engine — $25 refundable";
            showError(root, err.message);
          });
      });
    }
  }

  window.LegacyEngineFunnel = { init: init, renderCover: renderCover };
})(window, document);
