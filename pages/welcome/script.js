function localizeHtmlPage() {
  document.getElementById("page-title").textContent =
    chrome.i18n.getMessage("welcomeTitle");
  document.getElementById("welcome-title").textContent =
    chrome.i18n.getMessage("welcomeTitle");
  document.getElementById("welcome-agreement").textContent =
    chrome.i18n.getMessage("welcomeAgreement");
  document.getElementById("agree-button-full").textContent =
    chrome.i18n.getMessage("welcomeAgreeFull");
  document.getElementById("agree-button-partial").textContent =
    chrome.i18n.getMessage("welcomeAgreePartial");
}

document.addEventListener("DOMContentLoaded", localizeHtmlPage);

function setAgreement(autoClick) {
  chrome.storage.sync.set(
    {
      agreed: true,
      autoClickFinalDelete: autoClick,
    },
    () => {
      window.close();
    },
  );
}

document.getElementById("agree-button-full").addEventListener("click", () => {
  setAgreement(true);
});

document
  .getElementById("agree-button-partial")
  .addEventListener("click", () => {
    setAgreement(false);
  });
