"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { animateScroll as scroll } from "react-scroll";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ArrowDown,
} from "lucide-react";
import { createOrder, generateOrderId } from "@/lib/utils";

const TICKET_PRICE = 3;

interface PendingOrder {
  name: string;
  email: string;
  ticketCount: number;
  additionalNames: string[];
  organization?: string;
  referer: string | null;
  totalPrice: number;
}

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ referer: string }>;
}) {
  const router = useRouter();
  const [orderData, setOrderData] = useState<PendingOrder | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{
    referer: string;
  } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isCheckboxVisible, setIsCheckboxVisible] = useState(false);
  const checkboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadOrderData() {
      const p = await params;
      setResolvedParams(p);

      const stored = sessionStorage.getItem("pendingOrder");
      if (!stored) {
        router.push(`/${p.referer}`);
        return;
      }

      try {
        const data = JSON.parse(stored) as PendingOrder;
        setOrderData(data);
      } catch {
        router.push(`/${p.referer}`);
      }
    }
    loadOrderData();
  }, [params, router]);

  // Check of we onderaan de pagina zijn
  useEffect(() => {
    const checkIfAtBottom = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Check of we binnen 10px van de bodem zijn
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsCheckboxVisible(isAtBottom);
    };

    // Check meteen bij mount
    checkIfAtBottom();

    // Check ook na een korte delay om zeker te zijn dat alles geladen is
    const timeoutId = setTimeout(checkIfAtBottom, 100);

    // Check bij elke scroll
    window.addEventListener("scroll", checkIfAtBottom);
    window.addEventListener("resize", checkIfAtBottom);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", checkIfAtBottom);
      window.removeEventListener("resize", checkIfAtBottom);
    };
  }, [orderData]);

  const handleConfirmClick = async () => {
    if (!orderData || !resolvedParams) return;

    // Als checkbox niet zichtbaar is, scroll naar beneden
    if (!isCheckboxVisible) {
      scroll.scrollToBottom({
        duration: 500,
        smooth: "easeInOutQuart",
      });
      return;
    }

    // Als checkbox wel zichtbaar is maar niet akkoord, doe niets (knop is disabled)
    if (!agreedToTerms) {
      return;
    }

    // Als wel akkoord, ga door met bevestigen
    setIsConfirming(true);

    try {
      const orderId = generateOrderId();

      const createdOrder = await createOrder(orderId, {
        name: orderData.name,
        email: orderData.email,
        ticketCount: orderData.ticketCount,
        additionalNames: orderData.additionalNames,
        organization: orderData.organization || null,
        referer: orderData.referer,
        totalPrice: orderData.totalPrice,
      });

      sessionStorage.setItem("lastOrderId", createdOrder.id);
      sessionStorage.removeItem("pendingOrder");
      sessionStorage.removeItem("failedOrder");

      router.push(`/${resolvedParams.referer}/bevestiging/${createdOrder.id}`);
    } catch (error) {
      console.error("Failed to create order:", error);

      sessionStorage.setItem("failedOrder", JSON.stringify(orderData));
      sessionStorage.removeItem("pendingOrder");

      router.push(`/${resolvedParams.referer}/bevestiging/error`);
    }
  };

  const handleBack = () => {
    if (resolvedParams) {
      router.push(`/${resolvedParams.referer}`);
    }
  };

  if (!orderData || !resolvedParams) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Gegevens laden...</p>
        </div>
      </div>
    );
  }

  // Separate named and unnamed tickets
  const namedTickets: Array<{ name: string; number: number }> = [
    { name: orderData.name, number: 1 },
  ];

  let unnamedCount = 0;

  orderData.additionalNames.forEach((name, idx) => {
    if (name.trim() !== "") {
      namedTickets.push({ name, number: idx + 2 });
    } else {
      unnamedCount++;
    }
  });

  // Bepaal knop state
  const showScrollButton = !isCheckboxVisible;
  const showConfirmButton = isCheckboxVisible;

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-6">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4">
            <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Controleer je bestelling
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Kijk alles na voordat je definitief bevestigt
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Order summary - Mobile First */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl md:text-2xl">
                Bestelgegevens
              </CardTitle>
              <CardDescription className="text-sm">
                Controleer of alle informatie correct is
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Personal info - Stack on mobile */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Naam</div>
                  <div className="font-semibold text-sm sm:text-base break-words">
                    {orderData.name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Email
                  </div>
                  <div className="font-semibold text-sm sm:text-base break-all">
                    {orderData.email}
                  </div>
                </div>
              </div>

              {/* Organization */}
              {orderData.organization && (
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground mb-1">
                    Organisatie
                  </div>
                  <div className="font-semibold text-sm sm:text-base break-words">
                    {orderData.organization}
                  </div>
                </div>
              )}

              {/* Tickets section */}
              <div className="border-t pt-4 sm:pt-6">
                <div className="text-sm font-semibold text-muted-foreground mb-3">
                  Tickets ({orderData.ticketCount})
                </div>
                <div className="space-y-2">
                  {namedTickets.map((ticket) => (
                    <div
                      key={ticket.number}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-bold flex-shrink-0">
                        {ticket.number}
                      </div>
                      <div className="font-medium text-sm sm:text-base break-words flex-1">
                        {ticket.name}
                      </div>
                    </div>
                  ))}
                  {unnamedCount > 0 && (
                    <div className="text-xs sm:text-sm text-muted-foreground italic p-3">
                      + {unnamedCount} ticket{unnamedCount > 1 ? "s" : ""}{" "}
                      zonder naam
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 sm:pt-6 flex justify-between items-center gap-4">
                <span className="text-base sm:text-lg font-bold">
                  Totaal bedrag
                </span>
                <span className="text-xl sm:text-2xl font-bold text-primary">
                  €{orderData.totalPrice}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Warning message - Mobile Optimized */}
          <Card className="border-2 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 transition-all duration-300">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    Belangrijke informatie
                  </p>
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                    Door te bevestigen wordt je bestelling aangemaakt en ontvang
                    je een email met betaalinstructies. Je bestelling is pas
                    definitief na betaling.
                  </p>
                </div>
              </div>

              {/* Checkbox for agreement */}
              <div
                ref={checkboxRef}
                className="mt-4 pt-4 border-t border-amber-300 dark:border-amber-800"
              >
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-amber-400 dark:border-amber-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-amber-900 dark:text-amber-100 group-hover:text-amber-950 dark:group-hover:text-amber-50">
                    Ik ga akkoord en begrijp dat mijn bestelling wordt
                    aangemaakt bij bevestiging
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky action buttons - Fixed at bottom on mobile/tablet, normal on desktop */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t lg:relative lg:border-t-0 lg:p-0 lg:mt-6">
        <div className="container mx-auto max-w-2xl flex flex-col gap-3">
          <Button
            size="lg"
            onClick={handleConfirmClick}
            disabled={isConfirming || (showConfirmButton && !agreedToTerms)}
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                <span className="text-sm sm:text-base">Bevestigen...</span>
              </>
            ) : showScrollButton ? (
              <>
                <ArrowDown className="h-5 w-5 mr-2 animate-bounce" />
                <span className="text-sm sm:text-base">
                  Scroll naar beneden voor akkoord
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span className="text-sm sm:text-base">
                  Bestelling definitief aanmaken
                </span>
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleBack}
            disabled={isConfirming}
            className="w-full h-12 sm:h-14 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Terug
          </Button>
        </div>
      </div>
    </div>
  );
}
