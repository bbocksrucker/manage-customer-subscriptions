import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { Box, Text, Card, Layout, Page, Spinner, DatePicker } from "@shopify/polaris";



// i18n-Übersetzungen für Polaris setzen
const translations = {
  Polaris: {
    Common: {
      close: "Schließen",
      cancel: "Abbrechen",
      save: "Speichern",
    },
  },
};

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  console.log("🔍 Laden von ENV-Variablen in app.jsx...");
  console.log("SHOPIFY_API_KEY:", process.env.SHOPIFY_API_KEY);

  await authenticate.admin(request);

  return { 
    apiKey: "5890363ae30a4a3a434fe5df1c4319e3",
    host: new URL(request.url).searchParams.get("host") || "",
  };
};


export default function App() {
  const { apiKey, host } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey} host={host} i18n={translations}>
      <NavMenu>
        <Link to="/app" rel="home">Home</Link>
        <Link to="/app/additional">Additional page</Link>
        <Link to="/install">Install App</Link>
        <Link to="/dashboard">Dashboard</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify benötigt diese ErrorBoundary
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

