import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import { addDocumentResponseHeaders } from "./shopify.server";

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  addDocumentResponseHeaders(request, responseHeaders);

  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
