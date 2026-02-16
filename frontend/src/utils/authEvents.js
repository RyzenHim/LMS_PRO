export const AUTH_EVENTS = {
  SESSION_EXPIRED: "SESSION_EXPIRED",
};

let alreadyTriggered = false;

export const triggerSessionExpired = () => {
  if (alreadyTriggered) return;

  alreadyTriggered = true;
  window.dispatchEvent(new Event(AUTH_EVENTS.SESSION_EXPIRED));
};

export const resetSessionExpiredTrigger = () => {
  alreadyTriggered = false;
};
