/**
 * Legacy Engine — reservation success page controller.
 * Confirms the $25 deposit, then hands off to the Base44 intake form
 * (see /api/legacy-engine/base44-intake.js for the Phase-1 stub).
 */
(function (window, document) {
  "use strict";

  function init(vertical) {
    var params = new URLSearchParams(window.location.search);
    var checkoutSessionId = params.get("checkout_session_id");
    var leSession = params.get("le_session");

    var pending = {};
    try {
      pending = JSON.parse(window.sessionStorage.getItem("le_pending_reservation_" + vertical) || "{}");
    } catch (e) {}

    var statusEl = document.getElementById("le-success-status");
    var intakeBtn = document.getElementById("le-intake-btn");
    var fallbackEl = document.getElementById("le-intake-fallback");

    if (!checkoutSessionId) {
      if (statusEl) {
        statusEl.textContent =
          "We couldn't confirm a reservation on this page directly, but if Stripe charged you, you're all set — check your email for a receipt.";
      }
    }

    fetch("/api/legacy-engine/base44-intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vertical: vertical,
        session_id: leSession || pending.session_id,
        checkout_session_id: checkoutSessionId,
        email: pending.email,
        personalization: pending.personalization,
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        if (json && json.configured && json.url && intakeBtn) {
          intakeBtn.href = json.url;
          intakeBtn.classList.remove("le-btn-hidden");
          intakeBtn.addEventListener("click", function () {
            window.LegacyEngine.track("intake_start", {}, vertical);
          });
        } else if (fallbackEl) {
          fallbackEl.style.display = "block";
        }
      })
      .catch(function () {
        if (fallbackEl) fallbackEl.style.display = "block";
      });
  }

  window.LegacyEngineSuccess = { init: init };
})(window, document);
