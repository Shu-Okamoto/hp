/**
 * Role → page mapping for the admin console sidebar.
 *
 * Authentication itself is handled by Auth.js (`/auth.js` at the project
 * root). This file only describes which admin pages each role can access,
 * so AdminApp can filter its sidebar and clamp the active route on login.
 */

export const ROLE_PAGES = {
  owner: ["post", "prices", "news", "products", "sns"],
  staff: ["post", "prices"],
};

export function pagesFor(role) {
  return ROLE_PAGES[role] || [];
}
