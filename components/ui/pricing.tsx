"use client";

// Pricing component — shows three plan cards with a monthly/annual billing toggle.
// Adapted for Daily Meds: dark theme, GBP prices, Stripe checkout on paid plans.
// The popular card (Annual Member) floats slightly above the others on desktop.

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

// Shape of each pricing plan
interface PricingPlan {
  name: string;
  price: number;           // price shown when billing toggle is on "Monthly"
  yearlyPrice: number;     // effective monthly price when billed annually
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;            // link destination — used for the free plan
  isPopular: boolean;
  priceId?: string;        // Stripe price ID for monthly (or lifetime) billing
  yearlyPriceId?: string;  // Stripe price ID for annual billing
  planId?: string;         // plan identifier sent to Stripe webhook (e.g. "monthly")
  yearlyPlanId?: string;   // plan identifier for annual billing (e.g. "annual")
  isLifetime?: boolean;    // one-time payment — price never changes with toggle
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you.",
}: PricingProps) {
  // Toggle: true = monthly billing, false = annual billing
  const [isMonthly, setIsMonthly] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  // Fires confetti when the user switches to annual billing
  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ["#8B5CF6", "#6366F1", "#3B82F6", "#22D3EE", "#F43F5E"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  // Calls the Stripe checkout API and redirects the user to Stripe's payment page
  const handleStripeCheckout = async (plan: PricingPlan) => {
    const priceId = isMonthly ? plan.priceId : plan.yearlyPriceId;
    const planId   = isMonthly ? plan.planId  : plan.yearlyPlanId;

    if (!priceId) return;

    setLoadingPlan(plan.name);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-20">
      {/* Page header */}
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-medium tracking-tight sm:text-5xl text-[#F0F0F0]">
          {title}
        </h2>
        <p className="text-white/50 text-lg whitespace-pre-line max-w-xl mx-auto">
          {description}
        </p>
      </div>

      {/* Monthly / Annual toggle */}
      <div className="flex justify-center items-center gap-3 mb-12">
        <span className={cn("text-sm font-medium", isMonthly ? "text-[#F0F0F0]" : "text-white/40")}>
          Monthly
        </span>
        <Label>
          <Switch
            ref={switchRef as React.RefObject<HTMLButtonElement>}
            checked={!isMonthly}
            onCheckedChange={handleToggle}
          />
        </Label>
        <span className={cn("text-sm font-medium", !isMonthly ? "text-[#F0F0F0]" : "text-white/40")}>
          Annual{" "}
          <span className="text-[#8B5CF6] font-semibold">(Save 17%)</span>
        </span>
      </div>

      {/* Three plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ y: 50, opacity: 0 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    x: index === 2 ? -20 : index === 0 ? 20 : 0,
                    scale: index === 0 || index === 2 ? 0.95 : 1.0,
                  }
                : { y: 0, opacity: 1 }
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.4,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: index * 0.1,
            }}
            className={cn(
              "rounded-2xl p-6 flex flex-col relative",
              "bg-[#1A1A2E]",
              plan.isPopular
                ? "border-2 border-[#8B5CF6]"
                : "border border-white/10",
              !plan.isPopular && "mt-5 md:mt-5"
            )}
          >
            {/* Popular badge */}
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-[#8B5CF6] py-1 px-3 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-white fill-white" />
                <span className="text-white text-xs font-semibold">Popular</span>
              </div>
            )}

            <div className="flex-1 flex flex-col">
              {/* Plan name */}
              <p className="text-sm font-semibold text-white/50 tracking-widest uppercase">
                {plan.name}
              </p>

              {/* Price */}
              <div className="mt-6 flex items-end justify-center gap-1">
                <span className="text-5xl font-medium text-[#F0F0F0] tabular-nums">
                  {plan.isLifetime ? (
                    // Lifetime never changes — static price
                    <span>£{plan.price.toFixed(2)}</span>
                  ) : (
                    <NumberFlow
                      value={isMonthly ? plan.price : plan.yearlyPrice}
                      format={{
                        style: "currency",
                        currency: "GBP",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }}
                      transformTiming={{ duration: 500, easing: "ease-out" }}
                      willChange
                    />
                  )}
                </span>
                {!plan.isLifetime && plan.price > 0 && (
                  <span className="text-sm text-white/40 mb-2">/{plan.period}</span>
                )}
              </div>

              {/* Billing cadence */}
              {!plan.isLifetime && plan.price > 0 && (
                <p className="text-xs text-white/40 text-center mt-1">
                  {isMonthly ? "billed monthly" : "billed annually"}
                </p>
              )}
              {plan.isLifetime && (
                <p className="text-xs text-white/40 text-center mt-1">one-time payment</p>
              )}

              {/* Feature list */}
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white/80 text-left">{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="border-white/10 my-6" />

              {/* CTA button — free plan links to /signup, paid plans call Stripe */}
              {plan.priceId ? (
                <button
                  onClick={() => handleStripeCheckout(plan)}
                  disabled={loadingPlan === plan.name}
                  className={cn(
                    "w-full py-3 rounded-lg text-base font-medium transition-all duration-200",
                    plan.isPopular
                      ? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                      : "border border-white/20 text-white hover:bg-white/10"
                  )}
                >
                  {loadingPlan === plan.name ? "Redirecting..." : plan.buttonText}
                </button>
              ) : (
                <Link
                  href={plan.href}
                  className={cn(
                    "w-full py-3 rounded-lg text-base font-medium text-center transition-all duration-200 block",
                    "border border-white/20 text-white hover:bg-white/10"
                  )}
                >
                  {plan.buttonText}
                </Link>
              )}

              {/* Plan tagline */}
              <p className="mt-4 text-xs text-white/40 text-center">{plan.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
