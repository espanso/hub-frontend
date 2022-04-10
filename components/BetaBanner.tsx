import { CrossIcon, InlineAlert, Link, majorScale, Pane } from "evergreen-ui";
import { useState } from "react";

// Self-contained as it is a temporary component
export const BetaBanner = () => {
  const [isShowing, setIsShowing] = useLocalStorage("showBetaBanner", true);

  return isShowing ? (
    <Pane
      display="flex"
      paddingTop={majorScale(1)}
      paddingBottom={majorScale(1)}
      alignItems="center"
    >
      <Pane flexGrow={1}>
        <InlineAlert size={300}>
          Espanso Hub is currently in beta. If you have an issue, please report
          it{" "}
          <Link
            href="https://github.com/espanso/hub-frontend/issues"
            target="_blank"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            here
          </Link>
          .
        </InlineAlert>
      </Pane>
      <CrossIcon className="clickable" onClick={() => setIsShowing(false)} />
    </Pane>
  ) : (
    <></>
  );
};

// Taken from https://usehooks.com/useLocalStorage/
function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };
  return [storedValue, setValue] as const;
}

export default useLocalStorage;
