// RepoRAG GitHub Content Script
(function () {
  const currentUrl = window.location.href;
  const match = currentUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return;

  const owner = match[1];
  const repo = match[2];
  if (["settings", "notifications", "issues", "pulls", "explore"].includes(owner)) return;

  console.log(`[RepoRAG] Detected GitHub Repository: ${owner}/${repo}`);

  // Create floating trigger badge
  function injectRepoRAGButton() {
    if (document.getElementById("reporag-trigger-btn")) return;

    const btn = document.createElement("button");
    btn.id = "reporag-trigger-btn";
    btn.innerHTML = `
      <span class="reporag-icon">&lt;◉&gt;</span>
      <span class="reporag-text">Analyze with RepoRAG</span>
    `;

    btn.addEventListener("click", () => {
      // Send message to background to open sidepanel
      chrome.runtime.sendMessage({ action: "OPEN_SIDEPANEL", repoUrl: currentUrl }, (response) => {
        // Fallback: open local dashboard
        window.open(`http://localhost:5173?repo=${encodeURIComponent(currentUrl)}`, "_blank");
      });
    });

    document.body.appendChild(btn);
  }

  // Inject when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectRepoRAGButton);
  } else {
    injectRepoRAGButton();
  }
})();
