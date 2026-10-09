// Add locations here; the app has no fixed location limit (including seven or more).
// Address coordinates were matched with the U.S. Census geocoder on 2026-10-05.
// Direct review links were decoded from Comfy's Google-provided QR screenshots.
window.COMFY_LOCATIONS = [
  {
    id: 'main', name: 'Comfy Heating & Air Conditioning Inc.', area: 'San Leandro',
    address: '1946 Republic Ave, San Leandro, CA 94577',
    latitude: 37.704653983018, longitude: -122.171168843689,
    reviewUrl: 'https://g.page/r/Cfr1WiEOsn49EAE/review', enabled: true
  },
  {
    id: 'newark', name: 'Comfy Heating & Air Conditioning Inc.', area: 'Newark',
    address: '39899 Balentine Dr, Newark, CA 94560',
    latitude: 37.521828445582, longitude: -121.992437094773,
    reviewUrl: 'https://g.page/r/CRhaS3YgELgWEAE/review', enabled: true
  },
  {
    id: 'danville', name: 'Comfy Heating & Air Conditioning Inc.', area: 'Danville',
    address: '15 Railroad Ave, Danville, CA 94526',
    latitude: 37.823896829786, longitude: -122.003483746766,
    reviewUrl: 'https://g.page/r/CWNlem6GmDxFEAE/review', enabled: true
  }
];
// Public HTTPS URL of the separately hosted, secured project-post service.
// Leave blank until Google authorization and backend hosting have been connected.
window.COMFY_PHOTO_API = 'https://us-west1-comfy-technician-reviews.cloudfunctions.net/comfyApi';
