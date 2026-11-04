export const MENU_BADGES_EVENT = "menu-badges:refresh";

/** Call after something that can change a sidebar count (approving a business partner, answering a ticket). */
export const refreshMenuBadges = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(MENU_BADGES_EVENT));
};
