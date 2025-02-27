import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
  LATEST_API_VERSION,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiKey: '90c5ebb6328d9fe5e30a89084d97sj',
	apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
	apiSecretKey: '21209675ee94f65921b75430304ffh',
	//appUrl: process.env.SHOPIFY_APP_URL || "",
  appUrl: 'https://managecustomersubscriptions-muddy-field-2563.fly.dev',
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(","),
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.Custom,
  isEmbeddedApp: true,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
  future: {
    v3_webhookAdminContext: true,
  },
});

export default shopify;
export const authenticate = shopify.authenticate;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
