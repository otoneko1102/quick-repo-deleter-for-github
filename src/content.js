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
    console.error("Quick Repo Deleter Error:", error);
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

function initializeSkipper() {
  document.body.removeEventListener("click", handleDeleteClick);
  document.body.addEventListener("click", handleDeleteClick);
}

function initializeExtension() {
  chrome.storage.sync.get("agreed", (data) => {
    if (data.agreed === true) {
      initializeSkipper();
      document.addEventListener("turbo:load", initializeSkipper);
    }
  });
}

initializeExtension();
