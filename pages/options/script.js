function localizeOptionsPage() {
  document.getElementById("page-title").textContent =
    chrome.i18n.getMessage("optionsTitle");
  document.getElementById("options-title").textContent =
    chrome.i18n.getMessage("optionsTitle");
  document.getElementById("options-label-auto-click").textContent =
    chrome.i18n.getMessage("optionsEnableAutoClick");
}

function restore_options() {
  chrome.storage.sync.get(
    {
      autoClickFinalDelete: true,
    },
    (items) => {
      document.getElementById("autoClickFinalDelete").checked =
        items.autoClickFinalDelete;
    },
  );
}

function save_options() {
  const autoClick = document.getElementById("autoClickFinalDelete").checked;

  chrome.storage.sync.set(
    {
      autoClickFinalDelete: autoClick,
    },
    () => {
      const status = document.getElementById("status");
      status.textContent = chrome.i18n.getMessage("optionsSaved");
      setTimeout(() => {
        status.textContent = "";
      }, 1500);
    },
  );
}

document.addEventListener("DOMContentLoaded", () => {
  localizeOptionsPage();
  restore_options();
});

document
  .getElementById("autoClickFinalDelete")
  .addEventListener("change", save_options);
