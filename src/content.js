const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) {
      resolve(el);
      return;
    }
    const observer = new MutationObserver((mutations) => {
      const targetEl = document.querySelector(selector);
      if (targetEl) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(targetEl);
      }
    });
    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element not found: ${selector}`));
    }, timeout);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

async function automateDeletion() {
  try {
    const button1 = await waitForElement(
      '#repo-delete-proceed-button[data-next-stage="2"]',
    );
    await sleep(200);
    button1.click();
    const button2 = await waitForElement(
      '#repo-delete-proceed-button[data-next-stage="3"]',
    );
    await sleep(200);
    button2.click();
    const inputField = await waitForElement("#verification_field");
    await sleep(200);
    const repoName = inputField.getAttribute("data-repo-nwo");
    if (!repoName) {
      return;
    }
    inputField.value = repoName;
    inputField.dispatchEvent(new Event("input", { bubbles: true }));

    const finalButton = await waitForElement(
      '#repo-delete-proceed-button[type="submit"]',
    );
    if (finalButton.disabled) {
      finalButton.disabled = false;
    }

    chrome.storage.sync.get({ autoClickFinalDelete: true }, async (items) => {
      if (items.autoClickFinalDelete) {
        await sleep(500);
        finalButton.click();
      }
    });
  } catch (error) {
    console.error("Repo Delete Skipper Error:", error);
  }
}

function handleDeleteClick(e) {
  if (!window.location.pathname.includes("/settings")) {
    return;
  }
  const triggerButton = e.target.closest(
    "#dialog-show-repo-delete-menu-dialog",
  );
  if (triggerButton) {
    automateDeletion();
  }
}

const WARNING_ID = "qrd-warning-message";

function toggleWarningMessage(show) {
  if (!window.location.pathname.includes("/settings")) {
    return;
  }

  let warningEl = document.getElementById(WARNING_ID);
  const deleteButton = document.querySelector(
    "#dialog-show-repo-delete-menu-dialog",
  );
  const boxRow = deleteButton ? deleteButton.closest(".Box-row") : null;

  if (show) {
    if (!boxRow) return;
    if (warningEl) return;

    warningEl = document.createElement("div");
    warningEl.id = WARNING_ID;

    warningEl.className = "flash flash-danger";
    warningEl.style.padding = "12px";
    warningEl.style.marginTop = "12px";
    warningEl.style.flexBasis = "100%";
    warningEl.style.order = "99";

    warningEl.style.backgroundColor = "var(--bgColor-danger-emphasis, #d73a49)";
    warningEl.style.color = "var(--fgColor-onEmphasis, #ffffff)";

    warningEl.textContent = chrome.i18n.getMessage("warningMessage");

    boxRow.style.flexWrap = "wrap";
    boxRow.appendChild(warningEl);
  } else {
    if (warningEl) {
      if (boxRow) {
        boxRow.style.flexWrap = "";
      }
      warningEl.remove();
    }
  }
}

function initializeSkipper() {
  document.body.removeEventListener("click", handleDeleteClick);
  document.body.addEventListener("click", handleDeleteClick);
  toggleWarningMessage(true);
}

function disableSkipper() {
  document.body.removeEventListener("click", handleDeleteClick);
  toggleWarningMessage(false);
}

function initializeExtension() {
  chrome.storage.sync.get(["agreed", "extensionEnabled"], (data) => {
    const isAgreed = data.agreed === true;
    const isEnabled = data.extensionEnabled !== false;

    if (isAgreed && isEnabled) {
      initializeSkipper();
    } else {
      disableSkipper();
    }
  });
}

initializeExtension();

document.addEventListener("turbo:load", initializeExtension);

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && (changes.agreed || changes.extensionEnabled)) {
    initializeExtension();
  }
});
