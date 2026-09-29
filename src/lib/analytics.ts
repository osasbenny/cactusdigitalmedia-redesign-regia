// Basic consent: no Google script or requests until an explicit opt-in.
export const measurementId = import.meta.env?.VITE_GA_MEASUREMENT_ID || "";
const configured = /^G-[A-Z0-9]+$/.test(measurementId);
type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean;
};
let started = false;
let lastPath = "";
export function updateAnalytics(accepted: boolean, pathname: string) {
  if (!configured) return;
  const analytics = window as unknown as AnalyticsWindow;
  analytics[`ga-disable-${measurementId}`] = !accepted;
  if (!accepted) {
    if (started) {
      analytics.gtag?.("consent", "update", { analytics_storage: "denied" });
      clearAnalyticsCookies();
      // Unload the downloaded tag as well as suppressing further events.
      window.location.reload();
    }
    return;
  }
  if (!started) {
    analytics.dataLayer = [];
    analytics.gtag = (...args) => analytics.dataLayer!.push(args);
    analytics.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    analytics.gtag("js", new Date());
    analytics.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    const script = document.createElement("script");
    script.id = "cactus-google-analytics";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
    started = true;
  }
  if (lastPath !== pathname) {
    // Never send query strings, form fields or project briefs to Analytics.
    analytics.gtag?.("event", "page_view", {
      page_location: window.location.origin + pathname,
      page_title: document.title,
    });
    lastPath = pathname;
  }
}
function clearAnalyticsCookies() {
  const domains = [
    "",
    window.location.hostname,
    "." + window.location.hostname,
    ".cactusdigitalmedia.ng",
  ];
  for (const item of document.cookie.split(";")) {
    const name = item.split("=")[0].trim();
    if (!/^(_ga(?:_|$)|_gid$|_gat(?:_|$))/.test(name)) continue;
    for (const domain of domains)
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? "; Domain=" + domain : ""}`;
  }
}
