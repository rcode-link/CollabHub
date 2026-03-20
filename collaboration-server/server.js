import { Hocuspocus } from "@hocuspocus/server";
import { Logger } from "@hocuspocus/extension-logger";

const PORT = parseInt(process.env.COLLAB_PORT || "6002", 10);
const LARAVEL_URL = process.env.LARAVEL_URL || "http://localhost";
const COLLAB_SECRET = process.env.COLLAB_SECRET || "collab-secret";

const server = new Hocuspocus({
  port: PORT,
  name: "collabhub-collab",

  extensions: [new Logger()],

  // Authenticate users via Laravel API
  async onAuthenticate({ token, documentName }) {
    const docId = documentName.replace("document.", "");

    const response = await fetch(`${LARAVEL_URL}/api/v1/collaboration/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ document_id: docId }),
    });

    if (!response.ok) {
      throw new Error("Not authorized");
    }

    const data = await response.json();
    return { user: data.user };
  },

  // Load document from Laravel on first connection
  async onLoadDocument({ document, documentName }) {
    const docId = documentName.replace("document.", "");

    try {
      const response = await fetch(
        `${LARAVEL_URL}/api/v1/collaboration/documents/${docId}`,
        {
          headers: {
            Accept: "application/json",
            "X-Collab-Secret": COLLAB_SECRET,
          },
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      // If we have stored Y.js state, apply it
      if (data.yjs_state) {
        const state = Buffer.from(data.yjs_state, "base64");
        const Y = await import("yjs");
        Y.applyUpdate(document, new Uint8Array(state));
      }
    } catch (error) {
      console.error(`Failed to load document ${docId}:`, error.message);
    }
  },

  // Save document to Laravel when it changes
  async onStoreDocument({ documentName, document }) {
    const docId = documentName.replace("document.", "");
    const Y = await import("yjs");
    const state = Buffer.from(Y.encodeStateAsUpdate(document)).toString(
      "base64"
    );

    try {
      await fetch(
        `${LARAVEL_URL}/api/v1/collaboration/documents/${docId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Collab-Secret": COLLAB_SECRET,
          },
          body: JSON.stringify({ yjs_state: state }),
        }
      );
    } catch (error) {
      console.error(`Failed to store document ${docId}:`, error.message);
    }
  },
});

server.listen();
