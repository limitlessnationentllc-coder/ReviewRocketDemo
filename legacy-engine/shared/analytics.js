/**
 * Legacy Engine — funnel analytics
 *
 * Fires every stage-gate event to:
 *  1. window.dataLayer (GA4 / GTM, if present on the page)
 *  2. /api/legacy-engine/track (server-side structured stage-gate log)
 *
 * Stage gates (see /docs/legacy-engine/PRD-STAGE-GATES.md):
 *   0 ad_click        4 email_captured
 *   1 form_start      5 checkout_start
 *   2 form_complete   6 deposit_paid
 *   3 cover_generated 7 intake_start
 */
(function (window) {
  "use strict";

  var GATES = {
    page_view: 0,
    ad_click: 0,
    form_start: 1,
    form_complete: 2,
    cover_generated: 3,
    email_captured: 4,
    checkout_start: 5,
    deposit_paid: 6,
    intake_start: 7,
  };

  function getSessionId() {
    try {
      var key = "le_session_id";
      var id = window.localStorage.getItem(key);
      if (!id) {
        id =
          "le_" +
          Date.now().toString(36) +
          "_" +
          Math.random().toString(36).slice(2, 10);
        window.localStorage.setItem(key, id);
      }
      return id;
    } catch (e) {
      return "le_no_storage";
    }
  }

  function getParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
      return null;
    }
  }

  function track(eventName, metadata, vertical) {
    metadata = metadata || {};
    var gateId = GATES.hasOwnProperty(eventName) ? GATES[eventName] : -1;
    var payload = {
      schema: "legacy-engine.stage-gate.v1",
      gate: { id: gateId, name: eventName },
      vertical: vertical || document.body.getAttribute("data-vertical") || "unknown",
      session_id: getSessionId(),
      timestamp: new Date().toISOString(),
      page: window.location.pathname + window.location.search,
      metadata: metadata,
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(
      Object.assign({ event: "legacy_engine_" + eventName }, payload)
    );

    try {
      fetch("/api/legacy-engine/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {
      /* analytics must never break the funnel */
    }

    if (window.__LE_DEBUG__) {
      console.debug("[legacy-engine]", eventName, payload);
    }
  }

  function trackPageViewAndAdClick(vertical) {
    track("page_view", {}, vertical);
    var utmSource = getParam("utm_source");
    var gclid = getParam("gclid");
    var fbclid = getParam("fbclid");
    var flagKey = "le_ad_click_logged_" + vertical;
    var alreadyLogged = false;
    try {
      alreadyLogged = window.sessionStorage.getItem(flagKey) === "1";
    } catch (e) {}

    if ((utmSource || gclid || fbclid) && !alreadyLogged) {
      track(
        "ad_click",
        {
          utm_source: utmSource,
          utm_medium: getParam("utm_medium"),
          utm_campaign: getParam("utm_campaign"),
          gclid: gclid,
          fbclid: fbclid,
          referrer: document.referrer || null,
        },
        vertical
      );
      try {
        window.sessionStorage.setItem(flagKey, "1");
      } catch (e) {}
    }
  }

  window.LegacyEngine = window.LegacyEngine || {};
  window.LegacyEngine.track = track;
  window.LegacyEngine.trackPageViewAndAdClick = trackPageViewAndAdClick;
  window.LegacyEngine.getSessionId = getSessionId;
})(window);
