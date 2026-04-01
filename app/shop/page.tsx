"use client";

// /shop — Daily Meds merchandise store, powered by a Shopify Buy Button embed.
// Physical products only (branded items, merch). NOT for meditation subscriptions.
// Subscriptions are handled entirely by Stripe — Shopify is merch-only.
//
// HOW IT WORKS:
// 1. Natalie creates products in her Shopify admin (shopify.com)
// 2. In Shopify: Sales Channels → Buy Button → Create a collection button
// 3. Copy the collection ID shown in the embed code (looks like: 123456789012)
// 4. Paste it into NEXT_PUBLIC_SHOPIFY_COLLECTION_ID in .env.local
// 5. Fill in NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN

import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Shopify's Buy Button SDK attaches itself to window.ShopifyBuy after load.
// This tells TypeScript what shape it has.
declare global {
  interface Window {
    ShopifyBuy?: {
      buildClient: (opts: { domain: string; storefrontAccessToken: string }) => unknown;
      UI: {
        onReady: (client: unknown) => Promise<{
          createComponent: (type: string, opts: Record<string, unknown>) => void;
        }>;
      };
    };
  }
}

// These come from .env.local — fill them in before going live
const STORE_DOMAIN    = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN       ?? "";
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN  ?? "";
const COLLECTION_ID   = process.env.NEXT_PUBLIC_SHOPIFY_COLLECTION_ID      ?? "";

// The Shopify Buy Button SDK URL (Shopify hosts this, always up to date)
const SHOPIFY_SDK_URL = "https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js";

// Custom styling to match the Daily Meds dark design system.
// Shopify's Buy Button accepts CSS-in-JS style overrides in this format.
const SHOPIFY_OPTIONS: Record<string, unknown> = {
  product: {
    styles: {
      product: {
        "background-color": "#1F1F1F",
        "border-radius": "10px",
        "border": "0.5px solid rgba(255,255,255,0.08)",
        "overflow": "hidden",
        "@media (min-width: 601px)": {
          "max-width": "calc(33.333% - 16px)",
          "margin-left": "16px",
          "margin-bottom": "24px",
        },
      },
      title: {
        "color": "rgba(255,255,255,0.85)",
        "font-weight": "500",
        "font-size": "14px",
        "font-family": "Inter, sans-serif",
      },
      price: {
        "color": "rgba(255,255,255,0.55)",
        "font-family": "Inter, sans-serif",
      },
      compareAt: {
        "color": "rgba(255,255,255,0.25)",
      },
      button: {
        "background-color": "#ff41b3",
        "border-radius": "6px",
        "color": "white",
        "font-weight": "500",
        "font-family": "Inter, sans-serif",
        "font-size": "13px",
        ":hover": { "background-color": "#ff41b3" },
        ":focus": { "background-color": "#ff41b3" },
      },
    },
    text: { button: "Add to bag" },
    googleFonts: [],
  },
  productSet: {
    styles: {
      products: {
        "@media (min-width: 601px)": { "margin-left": "-16px" },
      },
    },
  },
  modalProduct: {
    contents: { img: false, imgWithCarousel: true, button: false, buttonWithQuantity: true },
    styles: {
      product: {
        "@media (min-width: 601px)": { "max-width": "100%", "margin-left": "0", "margin-bottom": "0" },
        "background-color": "#131313",
      },
      title: { "color": "rgba(255,255,255,0.9)", "font-family": "Inter, sans-serif" },
      price: { "color": "rgba(255,255,255,0.55)", "font-family": "Inter, sans-serif" },
      button: {
        "background-color": "#ff41b3",
        "color": "white",
        "font-family": "Inter, sans-serif",
        ":hover": { "background-color": "#ff41b3" },
      },
    },
    googleFonts: [],
  },
  option: {},
  cart: {
    styles: {
      cart: { "background-color": "#1F1F1F" },
      title: { "color": "rgba(255,255,255,0.85)", "font-family": "Inter, sans-serif" },
      header: { "background-color": "#1F1F1F" },
      lineItems: { "background-color": "#131313" },
      subtotalText: { "color": "rgba(255,255,255,0.55)", "font-family": "Inter, sans-serif" },
      subtotal: { "color": "rgba(255,255,255,0.85)", "font-family": "Inter, sans-serif" },
      notice: { "color": "rgba(255,255,255,0.35)", "font-family": "Inter, sans-serif" },
      currency: { "color": "rgba(255,255,255,0.55)" },
      close: { "color": "rgba(255,255,255,0.4)", ":hover": { "color": "white" } },
      empty: { "color": "rgba(255,255,255,0.35)", "font-family": "Inter, sans-serif" },
      noteDescription: { "color": "rgba(255,255,255,0.35)", "font-family": "Inter, sans-serif" },
      discountText: { "color": "rgba(255,255,255,0.55)" },
      discountIcon: { "fill": "rgba(255,255,255,0.55)" },
      discountAmount: { "color": "rgba(255,255,255,0.55)" },
      button: {
        "background-color": "#ff41b3",
        "color": "white",
        "font-family": "Inter, sans-serif",
        "font-weight": "500",
        ":hover": { "background-color": "#ff41b3" },
        ":focus": { "background-color": "#ff41b3" },
      },
    },
    text: {
      total: "Subtotal",
      button: "Checkout",
    },
    googleFonts: [],
    popup: false,
  },
  toggle: {
    styles: {
      toggle: {
        "background-color": "#ff41b3",
        ":hover": { "background-color": "#ff41b3" },
        ":focus": { "background-color": "#ff41b3" },
      },
      count: { "color": "white" },
      iconPath: { "fill": "white" },
    },
  },
  lineItem: {
    styles: {
      variantTitle: { "color": "rgba(255,255,255,0.45)", "font-family": "Inter, sans-serif" },
      title: { "color": "rgba(255,255,255,0.85)", "font-family": "Inter, sans-serif" },
      price: { "color": "rgba(255,255,255,0.55)", "font-family": "Inter, sans-serif" },
      fullPrice: { "color": "rgba(255,255,255,0.55)", "font-family": "Inter, sans-serif" },
      discount: { "color": "rgba(255,255,255,0.35)", "font-family": "Inter, sans-serif" },
      discountIcon: { "fill": "rgba(255,255,255,0.35)" },
      quantity: { "color": "rgba(255,255,255,0.75)", "font-family": "Inter, sans-serif" },
      quantityIncrement: {
        "background-color": "rgba(255,255,255,0.06)",
        "color": "rgba(255,255,255,0.75)",
        "border-color": "rgba(255,255,255,0.12)",
      },
      quantityDecrement: {
        "background-color": "rgba(255,255,255,0.06)",
        "color": "rgba(255,255,255,0.75)",
        "border-color": "rgba(255,255,255,0.12)",
      },
      quantityInput: {
        "color": "rgba(255,255,255,0.75)",
        "background-color": "rgba(255,255,255,0.04)",
        "border-color": "rgba(255,255,255,0.12)",
      },
    },
  },
};

export default function ShopPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "no-config" | "error">("loading");

  useEffect(() => {
    // If Shopify env vars are not yet filled in, show a placeholder instead of crashing
    if (!STORE_DOMAIN || !STOREFRONT_TOKEN || !COLLECTION_ID) {
      setStatus("no-config");
      return;
    }

    // Load the Shopify Buy Button SDK script, then initialise the store embed
    function initShopify() {
      const ShopifyBuy = window.ShopifyBuy;
      if (!ShopifyBuy?.UI) {
        setStatus("error");
        return;
      }

      const client = ShopifyBuy.buildClient({
        domain: STORE_DOMAIN,
        storefrontAccessToken: STOREFRONT_TOKEN,
      });

      ShopifyBuy.UI.onReady(client)
        .then((ui) => {
          if (!containerRef.current) return;
          ui.createComponent("collection", {
            id: COLLECTION_ID,
            node: containerRef.current,
            moneyFormat: "%C2%A3%7B%7Bamount%7D%7D", // URL-encoded "£{{amount}}"
            options: SHOPIFY_OPTIONS,
          });
          setStatus("ready");
        })
        .catch(() => setStatus("error"));
    }

    // If the SDK is already on the page (e.g. hot reload), initialise immediately
    if (window.ShopifyBuy?.UI) {
      initShopify();
      return;
    }

    // Otherwise inject the script tag and wait for it to load
    const existing = document.querySelector(`script[src="${SHOPIFY_SDK_URL}"]`);
    if (existing) {
      // Script tag exists but may not have fired onload yet — wait a tick
      existing.addEventListener("load", initShopify);
      return;
    }

    const script = document.createElement("script");
    script.src = SHOPIFY_SDK_URL;
    script.async = true;
    script.onload = initShopify;
    script.onerror = () => setStatus("error");
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", initShopify);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Navbar />

      <main className="flex-1">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-4" style={{ fontWeight: 500 }}>
            The Daily Meds Store
          </p>
          <h1 className="text-3xl sm:text-4xl text-white mb-3" style={{ fontWeight: 500 }}>
            Wear the reset.
          </h1>
          <p className="text-base text-white/50 max-w-md mx-auto leading-relaxed">
            Branded merchandise from Daily Meds. Practical things for impractical moments.
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-white/25 flex-wrap">
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              Secure checkout via Shopify
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C13 5.06 12.51 5 12 5s-1 .06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z"/>
              </svg>
              Ships worldwide
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              By Natalie Lauraine
            </div>
          </div>
        </section>

        {/* ── SHOPIFY EMBED ─────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

          {/* Loading spinner — shown while the SDK script loads */}
          {status === "loading" && (
            <div className="flex justify-center py-24">
              <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-pink-400 animate-spin" />
            </div>
          )}

          {/* No config — shown when env vars are not yet filled in */}
          {status === "no-config" && (
            <div
              className="flex flex-col items-center py-20 text-center max-w-sm mx-auto"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ background: "linear-gradient(135deg, #ec723d, #f4e71d)" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M20 6h-2.18c.07-.44.18-.88.18-1.3C18 2.1 15.9 0 13.3 0c-1.4 0-2.6.56-3.5 1.46L8 3.18 6.2 1.46C5.3.56 4.1 0 2.7 0 .1 0-2 2.1-2 4.7c0 .42.11.86.18 1.3H-2c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h22c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7.5-4.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S11 3.83 11 3s.67-1.5 1.5-1.5zM5.5 3c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S7.83 4.5 7 4.5 5.5 3.83 5.5 3zM20 19H2V8h7.08L7 10.08l1.41 1.41 3.09-3.09.5-.5.5.5 3.09 3.09L17 10.08 14.92 8H20v11z"/>
                </svg>
              </div>
              <p className="text-white text-sm mb-2" style={{ fontWeight: 500 }}>Shop coming soon</p>
              <p className="text-white/35 text-xs leading-relaxed">
                Merchandise is on its way. Check back soon for branded Daily Meds products.
              </p>
            </div>
          )}

          {/* Error — shown if the Shopify SDK fails to load */}
          {status === "error" && (
            <div className="flex flex-col items-center py-20 text-center">
              <p className="text-white/40 text-sm mb-1">Couldn&apos;t load the shop right now.</p>
              <p className="text-white/25 text-xs">Try refreshing the page.</p>
            </div>
          )}

          {/* The Shopify Buy Button renders itself into this div */}
          <div ref={containerRef} id="shopify-collection-embed" />

        </section>

        {/* ── SUBSCRIPTION CALLOUT ─────────────────────────────────────────── */}
        {/* Remind visitors that subscriptions are separate from merch */}
        <section className="border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm text-white/70 mb-1" style={{ fontWeight: 500 }}>
                Looking for meditation sessions?
              </p>
              <p className="text-xs text-white/35 leading-relaxed">
                Subscriptions and audio sessions are separate from the shop — find them on the pricing page.
              </p>
            </div>
            <a
              href="/pricing"
              className="shrink-0 text-sm text-white px-5 py-2.5 rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#ff41b3", fontWeight: 500 }}
            >
              View plans
            </a>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
