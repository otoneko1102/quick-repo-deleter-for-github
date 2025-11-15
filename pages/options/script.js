function localizeOptionsPage() {
  document.getElementById("page-title").textContent =
    chrome.i18n.getMessage("optionsTitle");
  document.getElementById("options-title").textContent =
    chrome.i18n.getMessage("optionsTitle");
  document.getElementById("options-label-enable").textContent =
    chrome.i18n.getMessage("optionsEnableExtension");
  document.getElementById("options-label-auto-click").textContent =
    chrome.i18n.getMessage("optionsEnableAutoClick");
}

function restore_options() {
  chrome.storage.sync.get(
    {
      extensionEnabled: true,
      autoClickFinalDelete: true,
    },
    (items) => {
      const enabled = items.extensionEnabled;
      document.getElementById("extensionEnabled").checked = enabled;
      document.getElementById("autoClickFinalDelete").checked =
        items.autoClickFinalDelete;

      document.getElementById("autoClickFinalDelete").disabled = !enabled;
      document
        .getElementById("labelAutoClick")
        .classList.toggle("disabled", !enabled);
    },
  );
}

function save_options() {
  const enabled = document.getElementById("extensionEnabled").checked;
  const autoClick = document.getElementById("autoClickFinalDelete").checked;

  document.getElementById("autoClickFinalDelete").disabled = !enabled;
  document
    .getElementById("labelAutoClick")
    .classList.toggle("disabled", !enabled);

  chrome.storage.sync.set(
    {
      extensionEnabled: enabled,
      autoClickFinalDelete: autoClick,
    },
    () => {
      const status = document.getElementById("status");
      status.textContent = chrome.i18n.getMessage("optionsSaved");
      status.classList.add("visible");
      setTimeout(() => {
        status.classList.remove("visible");
      }, 1500);
    },
  );
}

document.addEventListener("DOMContentLoaded", () => {
  localizeOptionsPage();
  restore_options();
});

document
  .getElementById("extensionEnabled")
  .addEventListener("change", save_options);
document
  .getElementById("autoClickFinalDelete")
  .addEventListener("change", save_options);
