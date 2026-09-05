import useLocalStorage from "./useLocalStorage";

export const DEFAULT_HIDDEN_ITEM_OPACITY = 0.5;

// Personal, client-only preference (not synced to other players) for how
// dim group-hidden items should look to this viewer. Backed by
// useLocalStorage's Recoil atomFamily, so every consumer (the settings
// slider in UserConfig and the item wrapper itself) re-renders immediately
// when it changes, with no page reload needed.
const useHiddenItemOpacity = () =>
  useLocalStorage("hiddenItemOpacity", DEFAULT_HIDDEN_ITEM_OPACITY);

export default useHiddenItemOpacity;
