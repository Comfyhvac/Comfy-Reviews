(() => {
  'use strict';
  const locations = (window.COMFY_LOCATIONS || []).filter(item => item.enabled &&
    Number.isFinite(item.latitude) && Number.isFinite(item.longitude) &&
    /^https:\/\/(g\.page|search\.google\.com|www\.google\.com)\//.test(item.reviewUrl));
  const $ = id => document.getElementById(id);
  const select = $('locationSelect');
  let savedId;
  try { savedId = localStorage.getItem('comfy-review-location'); } catch {}
  let requestVersion = 0;

  function km(a, b, c, d) {
    const rad = x => x * Math.PI / 180;
    const x = rad(c - a), y = rad(d - b);
    const h = Math.sin(x / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(y / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(h));
  }
  function show(item, message) {
    if (!item) { $('locationName').textContent = 'No review locations configured'; $('status').textContent = 'Add a verified review link in config.js.'; return; }
    $('locationName').textContent = item.area;
    $('status').textContent = message;
    select.value = item.id;
    window.comfySelectedLocation = item.id;
    const link = $('reviewLink'); link.href = item.reviewUrl; link.hidden = false;
    try {
      const qr = qrcode(0, 'M'); qr.addData(item.reviewUrl); qr.make();
      $('qrWrap').innerHTML = qr.createSvgTag(5, 4, 'Google review QR code for ' + item.area, 'Scan to review Comfy');
    } catch (_) { $('qrWrap').textContent = 'QR code unavailable. Use the button below.'; }
  }
  locations.forEach(item => {
    const option = document.createElement('option'); option.value = item.id; option.textContent = item.area; select.append(option);
  });
  const fallback = locations.find(item => item.id === savedId) || locations[0];
  show(fallback, 'Choose a location manually or allow location access.');

  function locate() {
    const version = ++requestVersion;
    if (!locations.length) return;
    if (!navigator.geolocation) { $('status').textContent = 'Location is unavailable. Choose a location above.'; return; }
    $('status').textContent = 'Checking current location…';
    navigator.geolocation.getCurrentPosition(position => {
      if (version !== requestVersion) return;
      const { latitude, longitude } = position.coords;
      const closest = [...locations].sort((a,b) => km(latitude, longitude, a.latitude, a.longitude) - km(latitude, longitude, b.latitude, b.longitude))[0];
      show(closest, 'Nearest configured Google profile selected. Confirm the location before showing a customer.');
    }, () => { if (version !== requestVersion) return; $('status').textContent = 'Location access was unavailable. Select the correct review location above.'; },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  }
  select.addEventListener('change', () => {
    ++requestVersion; // A late GPS response must not overwrite a manual selection.
    const item = locations.find(loc => loc.id === select.value);
    if (item) { try { localStorage.setItem('comfy-review-location', item.id); } catch {} show(item, 'Location selected manually.'); }
  });
  $('retry').addEventListener('click', locate);
  locate();
})();
