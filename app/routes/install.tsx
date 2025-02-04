import { useState } from "react";
// import axios from "axios";

export default function InstallPage() {
  const [installUrl, setInstallUrl] = useState<string>("");

  const getInstallUrl = async () => {
    try {
      // const response = await axios.get(
      //   "https://<your-supabase-project-ref>.functions.supabase.co/generate-install-url",
      //   {
      //     params: { shop: "example-store" },
      //   }
      // );
      setInstallUrl('');
    } catch (error) {
      console.error("Fehler beim Abrufen der Installations-URL:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Shopify App Installation</h1>
      <button onClick={getInstallUrl}>Installations-URL generieren</button>
      {installUrl && (
        <div>
          <p>Installations-URL:</p>
          <a href={installUrl} target="_blank" rel="noopener noreferrer">
            App installieren
          </a>
        </div>
      )}
    </div>
  );
}