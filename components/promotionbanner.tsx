"use client";

import { Gift, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export function PromotionBanner() {
  return (
    <Card className="relative overflow-hidden border-2 border-amber-400 dark:border-amber-500 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-yellow-950/40 shadow-xl animate-in fade-in slide-in-from-top duration-700">
      {/* Animated background sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 left-8 animate-bounce delay-100">
          <Sparkles className="h-4 w-4 text-amber-400 opacity-60" />
        </div>
        <div className="absolute top-8 right-12 animate-bounce delay-300">
          <Sparkles className="h-5 w-5 text-yellow-400 opacity-60" />
        </div>
        <div className="absolute bottom-6 left-16 animate-bounce delay-500">
          <Sparkles className="h-3 w-3 text-orange-400 opacity-60" />
        </div>
        <div className="absolute bottom-8 right-8 animate-bounce delay-700">
          <Sparkles className="h-4 w-4 text-amber-400 opacity-60" />
        </div>
      </div>

      {/* Gradient overlay for shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />

      <div className="relative p-6 flex items-center gap-4">
        {/* Icon with pulse animation */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400 dark:bg-amber-500 rounded-full animate-ping opacity-30" />
            <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600 p-4 rounded-full shadow-lg animate-pulse-slow">
              <Gift className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-bold text-amber-900 dark:text-amber-100 mb-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 animate-spin-slow" />
            Speciale Actie!
          </h3>
          <p className="text-base md:text-lg text-amber-800 dark:text-amber-200 font-medium">
            Koop{" "}
            <span className="font-bold text-orange-600 dark:text-orange-400">
              5 of meer tickets
            </span>{" "}
            en ontvang
            <span className="font-bold text-orange-600 dark:text-orange-400">
              {" "}
              gratis drankbonnetjes
            </span>
            <span className="inline-block ml-1">🍹</span>
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Eén gratis drankje per ticket bij bestellingen vanaf 5 stuks
          </p>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 animate-gradient-x" />
    </Card>
  );
}
