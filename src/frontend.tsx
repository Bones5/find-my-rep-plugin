/**
 * Frontend React app for Find My Rep plugin
 */

import { createRoot } from "react-dom/client";
import { FindMyRepApp } from "./components/FindMyRepApp";

// Wait for DOM to be ready
const initializeApp = () => {
  const containers = document.querySelectorAll(".find-my-rep-container");
  // Build a stable storage key from the page path + positional index so that
  // sessionStorage persistence works even when blockId is generated with
  // uniqid() on the server (i.e. the block attribute was never saved).
  const pagePath = window.location.pathname;

  containers.forEach((container, index) => {
    const blockId = container.id;
    const storageKey = `fmr-${pagePath}-${index}`;
    const perBlockTemplate =
      container.getAttribute("data-letter-template") || "";
    const root = createRoot(container);
    root.render(
      <FindMyRepApp
        blockId={blockId}
        storageKey={storageKey}
        perBlockTemplate={perBlockTemplate}
      />,
    );
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
