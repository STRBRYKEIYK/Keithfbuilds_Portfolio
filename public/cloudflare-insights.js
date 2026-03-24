/* Self-contained Cloudflare Insights fallback — no external fetches */
(function(){
  window.__cfBeacon = window.__cfBeacon || {};
  window.__cfBeacon.sendObjectBeacon = function(){ /* no-op */ };
  window.__cfInsights = window.__cfInsights || {};
})();
