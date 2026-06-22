/**
 * API endpoints for the Vicuras treater backend.
 *
 * Ported from the Flutter app's `lib/globals/urls.dart` so both clients talk
 * to the exact same routes.
 */
export const baseUrl = 'https://kundeportal-test.vicuras.dk';

export const loginUrl = `${baseUrl}/api/treater/login`;
export const profileUrl = `${baseUrl}/api/treater/Profile`;
export const dashboardUrl = `${baseUrl}/api/treater/Dashboard`;
export const shiftsUrl = `${baseUrl}/api/treater/shifts`;
export const specificDayBookingsUrl = `${baseUrl}/api/booking/specificdaybookings`;
export const roomUrl = `${baseUrl}/api/treater/room`;
export const locationImagesUrl = `${baseUrl}/api/sharepoint/locationimages`;
