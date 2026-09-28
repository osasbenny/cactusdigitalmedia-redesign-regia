// Shared by the form and server so the recorded disclosure matches what was shown.
export const smsConsentVersion = "2026-09-28";
export const smsConsents = [
  {
    name: "smsInquiryConsent",
    label: "SMS about my inquiry/project",
    text: "I agree to receive text messages from Cactus Digital Media regarding my inquiry, consultation, project updates, appointments, support, and service-related notifications. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is optional and is not a condition of purchasing services.",
  },
  {
    name: "smsMarketingConsent",
    label: "Marketing and promotional SMS",
    text: "I agree to receive marketing and promotional text messages from Cactus Digital Media, including service offers and relevant promotions. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is optional and is not a condition of purchasing services.",
  },
] as const;
