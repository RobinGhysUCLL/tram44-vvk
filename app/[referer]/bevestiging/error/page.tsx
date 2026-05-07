"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCcw, ArrowLeft, AlertCircle } from "lucide-react";

interface PendingOrder {
  name: string;
  email: string;
  ticketCount: number;
  additionalNames: string[];
  organization?: string;
  referer: string | null;
  paymentMethod: "online";
  totalPrice: number;
}

export default function ErrorPage({
  params,
}: {
  params: Promise<{ referer: string }>;
}) {
  const router = useRouter();
  const [orderData, setOrderData] = useState<PendingOrder | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{
    referer: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      const p = await params;
      setResolvedParams(p);

      // Try to retrieve the failed order from sessionStorage
      const stored = sessionStorage.getItem("failedOrder");
      if (stored) {
        try {
          const data = JSON.parse(stored) as PendingOrder;
          setOrderData(data);
        } catch {
          // If parsing fails, just continue without order data
        }
      }
    }
    loadData();
  }, [params]);

  const handleRetry = () => {
    if (resolvedParams && orderData) {
      // Restore the order data as pending order so user can retry
      sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));
      sessionStorage.removeItem("failedOrder");
      router.push(`/${resolvedParams.referer}/bevestiging/preview`);
    } else if (resolvedParams) {
      router.push(`/${resolvedParams.referer}`);
    }
  };

  const handleStartOver = () => {
    if (resolvedParams) {
      // Clear all stored data
      sessionStorage.removeItem("failedOrder");
      sessionStorage.removeItem("pendingOrder");
      router.push(`/${resolvedParams.referer}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        {/* Error animation */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6 animate-in zoom-in duration-700">
            <XCircle className="h-12 w-12 text-red-500 animate-in zoom-in duration-1000 delay-200" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-red-600 dark:text-red-400">
            Er ging iets mis
          </h1>
          <p className="text-lg text-muted-foreground">
            Je bestelling kon niet worden verwerkt
          </p>
        </div>

        <div className="space-y-6">
          {/* Error message */}
          <Card className="border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                Wat gebeurde er?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-red-900 dark:text-red-100">
                Je bestelling kon niet worden voltooid door een technisch
                probleem. Dit kan komen door:
              </p>
              <ul className="text-sm text-red-900 dark:text-red-100 space-y-2 list-disc list-inside">
                <li>Een tijdelijke serverprobleem</li>
                <li>Een verbindingsprobleem</li>
                <li>Een time-out tijdens het verwerken</li>
              </ul>
            </CardContent>
          </Card>

          {/* Saved data info */}
          {orderData && (
            <Card className="border-2 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">
                  ✓ Je gegevens zijn bewaard
                </CardTitle>
                <CardDescription className="text-green-900 dark:text-green-100">
                  Je hoeft niet opnieuw alles in te vullen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-900 dark:text-green-100">
                  We hebben je bestelgegevens bewaard. Wanneer je opnieuw
                  probeert, zijn al je gegevens nog beschikbaar.
                </p>
              </CardContent>
            </Card>
          )}

          {/* What to do */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Wat kun je doen?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl">1️⃣</div>
                <div>
                  <p className="font-semibold mb-1">Probeer het opnieuw</p>
                  <p className="text-sm text-muted-foreground">
                    Vaak lost een nieuwe poging het probleem al op
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl">2️⃣</div>
                <div>
                  <p className="font-semibold mb-1">Wacht even</p>
                  <p className="text-sm text-muted-foreground">
                    Als het niet werkt, wacht dan 5 minuten en probeer opnieuw
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl">3️⃣</div>
                <div>
                  <p className="font-semibold mb-1">Contacteer ons</p>
                  <p className="text-sm text-muted-foreground">
                    Blijft het probleem? Neem contact op met de organisatie
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleStartOver}
              className="flex-1 h-14 text-base border-2"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Opnieuw beginnen
            </Button>
            <Button
              size="lg"
              onClick={handleRetry}
              className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              <RefreshCcw className="h-5 w-5 mr-2" />
              {orderData ? "Opnieuw proberen" : "Terug naar formulier"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}