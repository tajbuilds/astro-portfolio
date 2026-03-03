(function () {
  if (!window.CMS) return;

  const detectCollectionFromHash = () => {
    const hash = window.location.hash || "";
    const match = hash.match(/collections\/([^/]+)/i);
    return match && match[1] ? decodeURIComponent(match[1]).toLowerCase() : "";
  };

  const pickCollectionRoot = (value) => {
    const candidate = (value || "").toLowerCase().trim();
    if (!candidate) return "";
    const root = candidate.split("/")[0];
    return root === "blog" || root === "work" || root === "shared" ? candidate : "";
  };

  const R2MediaLibrary = {
    name: "r2",
    init: ({ options = {}, handleInsert } = {}) => {
      const config = options.config || {};
      const endpoint = config.endpoint || "/api/media/upload";
      const defaultCollection = pickCollectionRoot(config.default_collection) || "shared";

      const uploadFiles = async (files, allowMultiple) => {
        const detected = pickCollectionRoot(detectCollectionFromHash()) || defaultCollection;
        const urls = [];

        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("name", file.name);
          formData.append("collection", detected);

          const response = await fetch(endpoint, {
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

          urls.push(payload.url);
        }

        handleInsert(allowMultiple || urls.length > 1 ? urls : urls[0]);
      };

      return {
        show: ({ allowMultiple = false } = {}) => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*,.svg,.pdf";
          input.multiple = Boolean(allowMultiple);
          input.onchange = async () => {
            const files = Array.from(input.files || []);
            if (!files.length) return;
            try {
              await uploadFiles(files, allowMultiple);
            } catch (error) {
              const message = error instanceof Error ? error.message : "Upload failed.";
              window.alert(message);
            }
          };
          input.click();
        },
        hide: () => {},
        onClearControl: () => {},
        onRemoveControl: () => {},
        enableStandalone: () => true,
      };
    },
  };

  window.CMS.registerMediaLibrary(R2MediaLibrary);
})();
