# Google Analytics setup

The owner supplied GA4 web stream Measurement ID `G-LFWWQPX923` on 29 September 2026. It is a public identifier, configured as the website default in src/lib/analytics.ts. VITE_GA_MEASUREMENT_ID can override it at build time; setting it explicitly empty disables Analytics. No password or API secret is required.

Use cactusdigitalmedia.ng as the stream URL. In Google Analytics → Admin → Data streams → website stream → Enhanced measurement, disable automatic page views based on browser history (the website sends its own route page views) and form interactions (inquiries are private). Keep Google Signals and advertising/remarketing off. Choose appropriate data retention in the property. These property settings require the owner's Google Analytics access.

Basic opt-in behavior: no Google tag or requests before acceptance. Accepted preference lasts 180 days. Reject keeps Analytics off. Footer Cookie settings supports withdrawal, removes accessible Analytics cookies and reloads to unload the tag. Existing collected data is not erased by withdrawal. Advertising consent is denied. Explicit page views contain paths and titles without query strings or form values.

Verify fresh-browser accept/reject behavior and check Reports → Realtime after an accepted visit. Browser tests stub Google requests to avoid sending automated test traffic to the production property.
