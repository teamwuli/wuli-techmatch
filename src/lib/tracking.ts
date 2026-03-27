export function buildTrackingUrl(contactId: string, destination: string): string {
  const encoded = encodeURIComponent(destination);
  return `/api/track?contact_id=${contactId}&to=${encoded}`;
}
