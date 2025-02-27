import { renderToString } from "react-dom/server";
import { RemixServer } from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";

export default function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  const markup = renderToString(
    <AppProvider i18n={translations} isEmbeddedApp>
      <RemixServer context={remixContext} url={request.url} />
    </AppProvider>
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}

