(function () {
  if (!window.CMS) return;

  const ROOTS = ["blog", "work", "shared"];

  const detectCollectionFromHash = () => {
    const hash = window.location.hash || "";
    const match = hash.match(/collections\/([^/]+)/i);
    const value = match && match[1] ? decodeURIComponent(match[1]).toLowerCase() : "";
    return ROOTS.includes(value) ? value : "";
  };

  const safeCollection = (value, fallback = "shared") => {
    const normalized = (value || "").toLowerCase().trim();
    return ROOTS.includes(normalized) ? normalized : fallback;
  };

  const bytesLabel = (value) => {
    if (!Number.isFinite(value) || value <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.min(units.length - 1, Math.floor(Math.log(value) / Math.log(1024)));
    const amount = value / Math.pow(1024, i);
    return `${amount.toFixed(amount >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
  };

  const setupStyles = () => {
    if (document.getElementById("r2-media-library-style")) return;
    const style = document.createElement("style");
    style.id = "r2-media-library-style";
    style.textContent = `
      .r2ml-overlay{position:fixed;inset:0;background:rgba(0,0,0,.56);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px}
      .r2ml-modal{width:min(1120px,98vw);height:min(86vh,860px);background:#121722;color:#e7ecf5;border:1px solid #243245;border-radius:14px;display:grid;grid-template-rows:auto auto 1fr auto;box-shadow:0 20px 50px rgba(0,0,0,.45)}
      .r2ml-head{display:flex;gap:10px;align-items:center;padding:12px 14px;border-bottom:1px solid #243245}
      .r2ml-title{font-size:16px;font-weight:700;margin-right:auto}
      .r2ml-select,.r2ml-btn{height:34px;border-radius:8px;border:1px solid #2d4159;background:#172130;color:#e7ecf5;padding:0 10px}
      .r2ml-btn{cursor:pointer;font-weight:600}
      .r2ml-btn:hover{background:#203248}
      .r2ml-btn:disabled{opacity:.45;cursor:not-allowed}
      .r2ml-status{font-size:12px;color:#9db0c9;padding:8px 14px;border-bottom:1px solid #243245;min-height:34px;display:flex;align-items:center}
      .r2ml-grid{padding:12px 14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;overflow:auto}
      .r2ml-card{border:1px solid #2a3c52;border-radius:10px;background:#172130;overflow:hidden;display:grid;grid-template-rows:130px auto;min-height:220px}
      .r2ml-thumb{display:flex;align-items:center;justify-content:center;background:#0e1624;color:#9db0c9;font-size:12px}
      .r2ml-thumb img{width:100%;height:100%;object-fit:cover;display:block}
      .r2ml-body{padding:8px;display:grid;gap:6px}
      .r2ml-key{font-size:12px;line-height:1.35;word-break:break-all;color:#dce6f4}
      .r2ml-meta{font-size:11px;color:#9db0c9}
      .r2ml-actions{display:flex;gap:6px;flex-wrap:wrap}
      .r2ml-actions .r2ml-btn{height:28px;font-size:12px;padding:0 8px}
      .r2ml-actions .danger{border-color:#6c2a2a;color:#ffb6b6}
      .r2ml-footer{display:flex;gap:10px;justify-content:flex-end;padding:10px 14px;border-top:1px solid #243245}
      .r2ml-empty{padding:18px;color:#9db0c9}
    `;
    document.head.appendChild(style);
  };

  const R2MediaLibrary = {
    name: "r2",
    init: ({ options = {}, handleInsert } = {}) => {
      const config = options.config || {};
      const uploadEndpoint = config.endpoint || "/api/media/upload";
      const listEndpoint = config.list_endpoint || "/api/media/list";
      const defaultCollection = safeCollection(config.default_collection, "shared");

      setupStyles();

      let overlay = null;
      let modal = null;
      let statusEl = null;
      let gridEl = null;
      let selectEl = null;
      let loadMoreBtn = null;
      let insertBtn = null;

      let activeCollection = defaultCollection;
      let nextCursor = null;
      let loading = false;
      let canInsert = true;
      let allowMultiple = false;
      let selectedUrls = [];

      const setStatus = (message) => {
        if (statusEl) statusEl.textContent = message || "";
      };

      const copyText = async (value) => {
        try {
          await navigator.clipboard.writeText(value);
          setStatus("URL copied.");
        } catch {
          setStatus("Could not copy URL.");
        }
      };

      const setSelection = (url) => {
        if (!allowMultiple) {
          selectedUrls = [url];
          return;
        }
        if (selectedUrls.includes(url)) {
          selectedUrls = selectedUrls.filter((u) => u !== url);
        } else {
          selectedUrls = [...selectedUrls, url];
        }
      };

      const refreshInsertButton = () => {
        if (!insertBtn) return;
        insertBtn.disabled = !canInsert || selectedUrls.length === 0;
      };

      const close = () => {
        if (!overlay) return;
        overlay.remove();
        overlay = null;
        modal = null;
        statusEl = null;
        gridEl = null;
        selectEl = null;
        loadMoreBtn = null;
        insertBtn = null;
        selectedUrls = [];
      };

      const uploadFiles = async (files) => {
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("name", file.name);
          formData.append("collection", activeCollection);

          const response = await fetch(uploadEndpoint, {
            method: "POST",
            body: formData,
            credentials: "same-origin",
          });
          const payload = await response
            .json()
            .catch(() => ({ ok: false, message: "Upload failed with non-JSON response." }));

          if (!response.ok || !payload.ok || !payload.url) {
            throw new Error(payload.message || "Upload failed.");
          }
        }
      };

      const renderItems = (items, { append }) => {
        if (!gridEl) return;
        if (!append) gridEl.innerHTML = "";
        if (!items.length && !append) {
          const empty = document.createElement("div");
          empty.className = "r2ml-empty";
          empty.textContent = "No media found for this collection yet.";
          gridEl.appendChild(empty);
          return;
        }

        items.forEach((item) => {
          const card = document.createElement("article");
          card.className = "r2ml-card";

          const thumb = document.createElement("div");
          thumb.className = "r2ml-thumb";
          if (item.isImage) {
            const img = document.createElement("img");
            img.src = item.url;
            img.alt = item.key;
            img.loading = "lazy";
            thumb.appendChild(img);
          } else {
            thumb.textContent = item.contentType || "File";
          }

          const body = document.createElement("div");
          body.className = "r2ml-body";

          const key = document.createElement("div");
          key.className = "r2ml-key";
          key.textContent = item.key;

          const meta = document.createElement("div");
          meta.className = "r2ml-meta";
          meta.textContent = `${bytesLabel(item.size)} · ${item.uploadedAt || "unknown"}`;

          const actions = document.createElement("div");
          actions.className = "r2ml-actions";

          const copyBtn = document.createElement("button");
          copyBtn.type = "button";
          copyBtn.className = "r2ml-btn";
          copyBtn.textContent = "Copy URL";
          copyBtn.onclick = () => copyText(item.url);

          const selectBtn = document.createElement("button");
          selectBtn.type = "button";
          selectBtn.className = "r2ml-btn";
          selectBtn.textContent = "Select";
          selectBtn.onclick = () => {
            setSelection(item.url);
            refreshInsertButton();
            setStatus(`${selectedUrls.length} item(s) selected.`);
          };

          const deleteBtn = document.createElement("button");
          deleteBtn.type = "button";
          deleteBtn.className = "r2ml-btn danger";
          deleteBtn.textContent = "Delete";
          deleteBtn.onclick = async () => {
            if (!window.confirm(`Delete ${item.key}?`)) return;
            const response = await fetch(`/api/media/${encodeURI(item.key)}`, {
              method: "DELETE",
              credentials: "same-origin",
            });
            const payload = await response.json().catch(() => ({ ok: false }));
            if (!response.ok || !payload.ok) {
              setStatus(payload.message || "Delete failed.");
              return;
            }
            setStatus("Deleted.");
            loadPage({ reset: true });
          };

          actions.append(copyBtn, selectBtn, deleteBtn);
          body.append(key, meta, actions);
          card.append(thumb, body);
          gridEl.appendChild(card);
        });
      };

      const loadPage = async ({ reset }) => {
        if (loading) return;
        loading = true;
        if (loadMoreBtn) loadMoreBtn.disabled = true;
        if (reset) {
          nextCursor = null;
          setStatus("Loading media...");
        }

        try {
          const params = new URLSearchParams({
            collection: activeCollection,
            limit: "24",
          });
          if (!reset && nextCursor) params.set("cursor", nextCursor);

          const response = await fetch(`${listEndpoint}?${params.toString()}`, {
            method: "GET",
            credentials: "same-origin",
          });
          const payload = await response
            .json()
            .catch(() => ({ ok: false, message: "List failed with non-JSON response." }));

          if (!response.ok || !payload.ok) {
            setStatus(payload.message || "Unable to load media.");
            return;
          }

          renderItems(payload.items || [], { append: !reset });
          nextCursor = payload.nextCursor || null;
          setStatus(`${(payload.items || []).length} item(s) loaded from ${activeCollection}.`);
          if (loadMoreBtn) loadMoreBtn.disabled = !nextCursor;
        } catch {
          setStatus("Network error while loading media.");
        } finally {
          loading = false;
        }
      };

      const openFileUpload = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*,.svg,.pdf";
        input.multiple = true;
        input.onchange = async () => {
          const files = Array.from(input.files || []);
          if (!files.length) return;
          setStatus(`Uploading ${files.length} file(s)...`);
          try {
            await uploadFiles(files);
            setStatus("Upload complete.");
            loadPage({ reset: true });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Upload failed.";
            setStatus(message);
          }
        };
        input.click();
      };

      const insertSelection = () => {
        if (!canInsert || !selectedUrls.length || typeof handleInsert !== "function") return;
        handleInsert(allowMultiple || selectedUrls.length > 1 ? selectedUrls : selectedUrls[0]);
        close();
      };

      const ensureModal = () => {
        if (overlay) return;

        overlay = document.createElement("div");
        overlay.className = "r2ml-overlay";
        overlay.addEventListener("click", (event) => {
          if (event.target === overlay) close();
        });

        modal = document.createElement("section");
        modal.className = "r2ml-modal";
        overlay.appendChild(modal);

        const head = document.createElement("div");
        head.className = "r2ml-head";
        const title = document.createElement("div");
        title.className = "r2ml-title";
        title.textContent = "R2 Media Library";

        selectEl = document.createElement("select");
        selectEl.className = "r2ml-select";
        ROOTS.forEach((root) => {
          const option = document.createElement("option");
          option.value = root;
          option.textContent = root;
          selectEl.appendChild(option);
        });
        selectEl.value = activeCollection;
        selectEl.onchange = () => {
          activeCollection = safeCollection(selectEl.value, "shared");
          selectedUrls = [];
          refreshInsertButton();
          loadPage({ reset: true });
        };

        const uploadBtn = document.createElement("button");
        uploadBtn.type = "button";
        uploadBtn.className = "r2ml-btn";
        uploadBtn.textContent = "Upload";
        uploadBtn.onclick = openFileUpload;

        const refreshBtn = document.createElement("button");
        refreshBtn.type = "button";
        refreshBtn.className = "r2ml-btn";
        refreshBtn.textContent = "Refresh";
        refreshBtn.onclick = () => loadPage({ reset: true });

        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "r2ml-btn";
        closeBtn.textContent = "Close";
        closeBtn.onclick = close;

        head.append(title, selectEl, uploadBtn, refreshBtn, closeBtn);

        statusEl = document.createElement("div");
        statusEl.className = "r2ml-status";

        gridEl = document.createElement("div");
        gridEl.className = "r2ml-grid";

        const footer = document.createElement("div");
        footer.className = "r2ml-footer";
        loadMoreBtn = document.createElement("button");
        loadMoreBtn.type = "button";
        loadMoreBtn.className = "r2ml-btn";
        loadMoreBtn.textContent = "Load more";
        loadMoreBtn.onclick = () => {
          if (!nextCursor) return;
          loadPage({ reset: false });
        };

        insertBtn = document.createElement("button");
        insertBtn.type = "button";
        insertBtn.className = "r2ml-btn";
        insertBtn.textContent = "Use selected";
        insertBtn.onclick = insertSelection;

        footer.append(loadMoreBtn, insertBtn);
        modal.append(head, statusEl, gridEl, footer);
        document.body.appendChild(overlay);
      };

      return {
        show: ({ config: showConfig = {}, allowMultiple: allowMulti = false } = {}) => {
          const mapped = safeCollection(showConfig.collection || detectCollectionFromHash(), defaultCollection);
          activeCollection = mapped;
          allowMultiple = Boolean(allowMulti);
          canInsert = typeof handleInsert === "function";
          selectedUrls = [];

          ensureModal();
          if (selectEl) selectEl.value = activeCollection;
          refreshInsertButton();
          loadPage({ reset: true });
        },
        hide: () => close(),
        onClearControl: () => {},
        onRemoveControl: () => {},
        enableStandalone: () => true,
      };
    },
  };

  window.CMS.registerMediaLibrary(R2MediaLibrary);
})();
