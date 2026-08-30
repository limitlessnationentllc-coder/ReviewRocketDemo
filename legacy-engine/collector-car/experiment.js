/**
 * Legacy Engine — Experiment #001: Collector Car Legacy (redesign)
 *
 * Reuses the Phase 1 backend contracts (generate-cover, capture-email,
 * LegacyEngineFunnel.renderCover) but drives an entirely new front-end:
 * Imagine Yours instant render, a 3-step wizard, three demo archives with
 * an interactive spread explorer, a personalized result screen, and a
 * (placeholder, non-activated) reservation offer.
 *
 * Stripe is intentionally NOT wired up here — swap STRIPE_LINK_HERE below
 * for a real Stripe Payment Link when ready to accept deposits.
 */
(function () {
  "use strict";

  var VERTICAL = "collector-car";

  // ---- One-line swap points (see docs/legacy-engine/SETUP.md) ----------
  // Real Stripe Checkout/webhook code already exists in
  // /api/legacy-engine/create-checkout-session.js — this experiment
  // deliberately does not call it. Swap this single line for a real
  // Stripe Payment Link URL to activate reservations.
  var STRIPE_LINK_HERE = "#";
  // Lead notifications already go out via the OWNER_EMAIL env var used by
  // /api/legacy-engine/capture-email.js. This constant is kept here only
  // as the single-line reference point the brief asked for; the real
  // swap point for where leads land is OWNER_EMAIL in Vercel env vars.
  var YOUR_EMAIL_HERE = "reservations@legacyengine.example";

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function track(event, meta) {
    if (window.LegacyEngine) window.LegacyEngine.track(event, meta || {}, VERTICAL);
  }

  document.addEventListener("DOMContentLoaded", function () {
    window.LegacyEngine.trackPageViewAndAdClick(VERTICAL);

    initSmoothScroll();
    initImagineYours();
    initArchiveSwitcher();
    initSpreadExplorer();
    initJacketSequence();
    initPhotoUpload();
    initWizard();
    initReservationLink();
    initScrollReveal();
    initVisibilityTracking();
    initAbandonmentRecovery();
  });

  // ---------------------------------------------------------------------
  // Smooth scroll to the wizard (also used by Imagine Yours + exit modal)
  // ---------------------------------------------------------------------
  function initSmoothScroll() {
    $all("[data-scroll-to-wizard]").forEach(function (el) {
      el.addEventListener("click", function (evt) {
        evt.preventDefault();
        var target = $("#x-wizard-section");
        if (!target) return;
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        copyImagineYoursIntoWizard();
      });
    });
  }

  function copyImagineYoursIntoWizard() {
    var year = $("#im-year") && $("#im-year").value;
    var make = $("#im-make") && $("#im-make").value;
    var model = $("#im-model") && $("#im-model").value;
    if (year && !$("#w1-year").value) $("#w1-year").value = year;
    if (make && !$("#w1-make").value) $("#w1-make").value = make;
    if (model && !$("#w1-model").value) $("#w1-model").value = model;
  }

  // ---------------------------------------------------------------------
  // Imagine Yours — instant cover render (no email, no AI call, instant)
  // ---------------------------------------------------------------------
  function initImagineYours() {
    var form = $("#x-imagine-form");
    if (!form) return;
    var familyEl = $("#x-imagine-family");
    var titleEl = $("#x-imagine-title");
    var yearsEl = $("#x-imagine-years");
    var spineEl = $("#x-imagine-spine");
    var rendered = false;
    var started = false;

    function update() {
      var year = ($("#im-year").value || "").trim();
      var make = ($("#im-make").value || "").trim();
      var model = ($("#im-model").value || "").trim();
      var family = ($("#im-family").value || "").trim();

      var titleParts = [year, make, model].filter(Boolean);
      titleEl.textContent = titleParts.length ? titleParts.join(" ").toUpperCase() : "Your Car, Your Name Here";
      familyEl.textContent = family ? ("The " + family + " Family").toUpperCase() : "The Family Archive";
      yearsEl.textContent = year ? year + " — Present" : "";
      if (spineEl) {
        spineEl.textContent = family && model ? (family + " • " + [year, model].filter(Boolean).join(" ")).toUpperCase() : "LEGACY ENGINE";
      }

      if (year && make && model && family && !rendered) {
        rendered = true;
        track("imagine_yours_cover_rendered", { year: year, make: make, model: model });
      }
    }

    $all("input", form).forEach(function (el) {
      el.addEventListener("input", function () {
        if (!started) {
          started = true;
          track("imagine_yours_started", {});
        }
        update();
      });
    });

    var cta = $("#x-imagine-cta");
    if (cta) {
      cta.addEventListener("click", function () {
        track("imagine_yours_cta_clicked", {});
      });
    }
  }

  // ---------------------------------------------------------------------
  // Demo archive switcher (Mustang / Camaro / Corvette)
  // ---------------------------------------------------------------------
  function initArchiveSwitcher() {
    var tabs = $all("#x-archive-tabs .x-archive-tab");
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var key = tab.getAttribute("data-archive");
        tabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
        });
        $all("[data-archive-panel]").forEach(function (panel) {
          panel.classList.toggle("is-active", panel.getAttribute("data-archive-panel") === key);
        });
        track("demo_switcher_used", { archive: key });
      });
    });
  }

  // ---------------------------------------------------------------------
  // Interactive spread explorer (Story / Restoration / Provenance / Memories)
  // ---------------------------------------------------------------------
  function initSpreadExplorer() {
    var tabs = $all("#x-spread-tabs .x-spread-tab");
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var key = tab.getAttribute("data-spread");
        tabs.forEach(function (t) {
          t.classList.toggle("is-active", t === tab);
        });
        $all("[data-spread-panel]").forEach(function (panel) {
          panel.classList.toggle("is-active", panel.getAttribute("data-spread-panel") === key);
        });
        track("demo_switcher_used", { spread: key });
      });
    });
  }

  // ---------------------------------------------------------------------
  // Jacket reveal sequence (dust jacket -> hardcover -> spine -> spread)
  // ---------------------------------------------------------------------
  function initJacketSequence() {
    var steps = $all("#x-jacket-steps .x-spread-tab");
    if (!steps.length) return;
    steps.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-jacket-step");
        steps.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        $all("[data-jacket-view]").forEach(function (view) {
          view.classList.toggle("is-active", view.getAttribute("data-jacket-view") === key);
        });
        track("demo_switcher_used", { jacket_step: key });
      });
    });
  }

  // ---------------------------------------------------------------------
  // Photo upload (resized client-side, never sent to the AI image model)
  // ---------------------------------------------------------------------
  var wizardPhotoDataUrl = null;

  function initPhotoUpload() {
    var input = $("#x-photo-input");
    var preview = $("#x-photo-preview");
    if (!input) return;
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var maxDim = 900;
          var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          var w = Math.round(img.width * scale);
          var h = Math.round(img.height * scale);
          var canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          wizardPhotoDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          if (preview) {
            preview.innerHTML = "";
            var thumb = document.createElement("img");
            thumb.src = wizardPhotoDataUrl;
            preview.appendChild(thumb);
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // ---------------------------------------------------------------------
  // 3-step wizard
  // ---------------------------------------------------------------------
  var wizardState = { year: "", make: "", model: "", nickname: "", firstOwner: "", memory: "", whyMatters: "", firstName: "", email: "" };

  function showWizardStep(step) {
    $all("[data-wizard-step]").forEach(function (el) {
      el.classList.toggle("is-active", el.getAttribute("data-wizard-step") === String(step));
    });
    var label = $("#x-wizard-progress-label");
    var dots = $all("#x-wizard-progress .x-wizard__dots span");
    if (step === "generating") {
      if (label) label.textContent = "Creating your preview…";
      dots.forEach(function (d) {
        d.classList.add("is-done");
        d.classList.remove("is-active");
      });
      return;
    }
    if (label) label.textContent = "Step " + step + " of 3";
    dots.forEach(function (d, i) {
      d.classList.toggle("is-done", i < step - 1);
      d.classList.toggle("is-active", i === step - 1);
    });
  }

  function wizardError(msg) {
    var el = $("#x-wizard-error");
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle("is-visible", Boolean(msg));
  }

  function initWizard() {
    var wizard = $("#x-wizard");
    if (!wizard) return;

    $all("[data-wizard-next]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var step = Number(btn.getAttribute("data-wizard-next"));
        wizardError("");
        if (step === 1) {
          var year = $("#w1-year").value.trim();
          var make = $("#w1-make").value.trim();
          var model = $("#w1-model").value.trim();
          if (!year || !make || !model) {
            wizardError("Please tell us the year, make, and model.");
            return;
          }
          wizardState.year = year;
          wizardState.make = make;
          wizardState.model = model;
          wizardState.nickname = $("#w1-nickname").value.trim();
          track("preview_step_1_completed", { year: year, make: make, model: model, has_photo: Boolean(wizardPhotoDataUrl) });
          showWizardStep(2);
        } else if (step === 2) {
          var firstOwner = $("#w2-firstOwner").value.trim();
          var memory = $("#w2-memory").value.trim();
          var whyMatters = $("#w2-whyMatters").value.trim();
          if (!firstOwner || !memory || !whyMatters) {
            wizardError("A few words on each question help us tell the story right.");
            return;
          }
          wizardState.firstOwner = firstOwner;
          wizardState.memory = memory;
          wizardState.whyMatters = whyMatters;
          track("preview_step_2_completed", { memory_length: memory.length });
          showWizardStep(3);
        }
      });
    });

    $all("[data-wizard-back]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var step = Number(btn.getAttribute("data-wizard-back"));
        wizardError("");
        showWizardStep(step - 1);
      });
    });

    $("#x-wizard-submit").addEventListener("click", function (evt) {
      evt.preventDefault();
      wizardError("");
      var firstName = $("#w3-firstName").value.trim();
      var email = $("#w3-email").value.trim();
      var consent = $("#w3-consent").checked;

      if (!firstName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !consent) {
        wizardError("Please add your first name, a valid email, and check the consent box.");
        return;
      }
      wizardState.firstName = firstName;
      wizardState.email = email;
      track("preview_step_3_completed", {});

      showWizardStep("generating");
      generatePersonalizedResult();
    });
  }

  function generatePersonalizedResult() {
    var itemName = [wizardState.year, wizardState.make, wizardState.model].filter(Boolean).join(" ");
    var memoryCombined = wizardState.memory + " " + wizardState.whyMatters;
    var sessionId = window.LegacyEngine.getSessionId();

    var personalization = {
      itemName: itemName,
      year: wizardState.year,
      make: wizardState.make,
      model: wizardState.model,
      nickname: wizardState.nickname,
      firstOwner: wizardState.firstOwner,
      memory: wizardState.memory,
      whyMatters: wizardState.whyMatters,
      ownerName: wizardState.firstName,
    };

    // Lead capture — durable log + best-effort owner notification. See
    // YOUR_EMAIL_HERE / OWNER_EMAIL note at the top of this file.
    fetch("/api/legacy-engine/capture-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: wizardState.email, vertical: VERTICAL, session_id: sessionId, personalization: personalization }),
    }).catch(function () {});

    fetch("/api/legacy-engine/generate-cover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vertical: VERTICAL, itemName: itemName, year: wizardState.year, memory: memoryCombined }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        if (!json || !json.ok) throw new Error("cover generation failed");
        var canvas = $("#x-result-canvas");
        return window.LegacyEngineFunnel.renderCover(canvas, {
          backgroundImage: json.backgroundImage,
          photoDataUrl: wizardPhotoDataUrl,
          itemName: itemName,
          year: wizardState.year,
          ownerName: wizardState.firstName,
          memory: wizardState.memory,
        });
      })
      .then(function () {
        renderPersonalizedNarrative();
        revealResultAndOffer();
      })
      .catch(function (err) {
        console.error(err);
        showWizardStep(3);
        wizardError("We couldn't build your preview just now — please try again.");
      });
  }

  function renderPersonalizedNarrative() {
    var photoWrap = $("#x-result-photo-wrap");
    if (photoWrap && wizardPhotoDataUrl) {
      photoWrap.style.backgroundImage = "url(" + wizardPhotoDataUrl + ")";
      photoWrap.style.backgroundSize = "cover";
      photoWrap.style.backgroundPosition = "center";
    }
    var narrativeEl = $("#x-result-narrative");
    if (narrativeEl) {
      var opener = wizardState.firstOwner ? "It began with " + wizardState.firstOwner + ". " : "";
      narrativeEl.textContent = opener + wizardState.memory;
    }
  }

  function revealResultAndOffer() {
    var wizardSection = $("#x-wizard-section");
    var resultSection = $("#x-result-section");
    var offerSection = $("#x-offer-section");
    if (resultSection) resultSection.classList.add("is-active");
    if (offerSection) offerSection.classList.add("is-active");
    track("cover_generated", {});
    if (resultSection) {
      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultSection.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  }

  // ---------------------------------------------------------------------
  // Reservation CTA (placeholder — Stripe intentionally not activated)
  // ---------------------------------------------------------------------
  function initReservationLink() {
    var btn = $("#x-reservation-btn");
    if (!btn) return;
    btn.setAttribute("href", STRIPE_LINK_HERE);
    btn.addEventListener("click", function (evt) {
      track("reservation_clicked", {});
      if (STRIPE_LINK_HERE === "#") {
        evt.preventDefault();
        wizardError("");
        alert("Reservations aren't open yet in this preview — Stripe hasn't been activated.");
      }
    });
  }

  // ---------------------------------------------------------------------
  // Scroll reveal + visibility-based analytics (book/story/offer viewed)
  // ---------------------------------------------------------------------
  function initScrollReveal() {
    var items = $all("[data-reveal]");
    if (!items.length || !window.IntersectionObserver) {
      items.forEach(function (el) {
        el.classList.add("is-shown");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-shown");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    items.forEach(function (el) {
      el.classList.add("x-reveal");
      io.observe(el);
    });
  }

  function initVisibilityTracking() {
    if (!window.IntersectionObserver) return;
    var once = function (selector, eventName) {
      var el = $(selector);
      if (!el) return;
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              track(eventName, {});
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      io.observe(el);
    };
    once("#x-result-canvas", "personalized_book_viewed");
    once("#x-result-narrative", "personalized_story_viewed");
    once("#x-offer-section", "offer_viewed");
  }

  // ---------------------------------------------------------------------
  // Abandonment recovery — once per session, no timers, no discounts
  // ---------------------------------------------------------------------
  function initAbandonmentRecovery() {
    var SESSION_KEY = "le_exit_message_shown_collector_car";
    var alreadyShown = false;
    try {
      alreadyShown = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch (e) {}
    if (alreadyShown) return;

    var isMobile = window.matchMedia("(max-width: 760px)").matches;
    var wizardStarted = false;
    document.addEventListener(
      "focus",
      function (evt) {
        if (evt.target && evt.target.closest && evt.target.closest("#x-wizard")) {
          wizardStarted = true;
        }
      },
      true
    );

    function markShown(surface) {
      alreadyShown = true;
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch (e) {}
      track("exit_message_shown", { surface: surface });
    }

    function showExitOverlay() {
      if (alreadyShown) return;
      var overlay = $("#x-exit-overlay");
      if (!overlay) return;
      overlay.classList.add("is-visible");
      markShown("desktop_exit_intent");
    }

    function showBottomSheet() {
      if (alreadyShown) return;
      var sheet = $("#x-bottom-sheet");
      if (!sheet) return;
      sheet.classList.add("is-visible");
      markShown("mobile_bottom_sheet");
    }

    if (!isMobile) {
      document.addEventListener("mouseout", function (evt) {
        if (alreadyShown || wizardStarted) return;
        if (evt.clientY <= 0 && !evt.relatedTarget) {
          showExitOverlay();
        }
      });
      var overlay = $("#x-exit-overlay");
      var closeBtn = $("#x-exit-close");
      var dismissBtn = $("#x-exit-dismiss");
      var ctaBtn = $("#x-exit-cta");
      [closeBtn, dismissBtn].forEach(function (btn) {
        if (!btn) return;
        btn.addEventListener("click", function () {
          overlay.classList.remove("is-visible");
        });
      });
      if (ctaBtn) {
        ctaBtn.addEventListener("click", function () {
          track("exit_message_clicked", {});
          overlay.classList.remove("is-visible");
        });
      }
    } else {
      var triggered = false;
      window.addEventListener("scroll", function () {
        if (triggered || alreadyShown || wizardStarted) return;
        var scrollDepth = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
        if (scrollDepth > 0.6) {
          triggered = true;
          showBottomSheet();
        }
      });
      var sheetCta = $("#x-sheet-cta");
      if (sheetCta) {
        sheetCta.addEventListener("click", function () {
          track("exit_message_clicked", {});
          $("#x-bottom-sheet").classList.remove("is-visible");
        });
      }
    }
  }
})();
