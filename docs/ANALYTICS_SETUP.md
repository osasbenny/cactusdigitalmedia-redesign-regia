# Google Analytics setup

Owner provides the GA4 web data stream Measurement ID (G- followed by letters/numbers): Google Analytics → Admin → Data streams → website stream → Measurement ID. No password, API secret or account access token required.

Set VITE_GA_MEASUREMENT_ID as a public build environment variable in Vercel Production and Preview, then rebuild. Empty/invalid ID disables Analytics. Use the public production domains as stream URLs. Keep enhanced measurement that captures form interactions disabled; this site only deliberately sends page views without query strings or form content. Configure data retention and Google Signals in the property to match the published privacy choices; do not enable advertising/remarketing without a separate review.

Basic opt-in behavior: do not load Google tags or send requests before acceptance. Accepted preference lasts 180 days. Reject keeps Analytics off. Footer Cookie settings supports withdrawal, removes accessible Analytics cookies and reloads the page after disabling the loaded tag. Existing data is not erased by withdrawal. No tracking is active until a valid Measurement ID is configured. Verify fresh-browser accept/reject behavior and GA4 Realtime after activation.
