/**
 * Type-safe Google Tag Manager event dispatcher.
 * Allows pushing analytics and conversion tracking events to window.dataLayer.
 */
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export const sendGTMEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
): void => {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventParams,
  });
};
