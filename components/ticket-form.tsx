"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Minus,
  Plus,
  CreditCard,
  Ticket,
  Users,
  Mail,
  User,
  X,
  ShieldCheck,
} from "lucide-react";

interface TicketFormProps {
  referer: string;
}

const TICKET_PRICE = 3; // €3 per ticket

export function TicketForm({ referer }: TicketFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [additionalNames, setAdditionalNames] = useState<string[]>([]);
  const [organization, setOrganization] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | null>("online");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const totalPrice = ticketCount * TICKET_PRICE;

  // Check if all additional names are filled
  const allNamesFilledIn = additionalNames.every((name) => name.trim() !== "");
  const canSubmit = privacyAccepted && allNamesFilledIn;

  // Load pending order data if it exists (when user comes back from preview)
  useEffect(() => {
    const stored = sessionStorage.getItem("pendingOrder");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setName(data.name || "");
        setEmail(data.email || "");
        setTicketCount(data.ticketCount || 1);
        setOrganization(data.organization || "");
        // Ensure we have the right number of additional names with the loaded data
        const loadedNames = data.additionalNames || [];
        const expectedCount = (data.ticketCount || 1) - 1;
        // Pad with empty strings if needed
        while (loadedNames.length < expectedCount) {
          loadedNames.push("");
        }
        setAdditionalNames(loadedNames.slice(0, expectedCount));
        setPaymentMethod(data.paymentMethod || "online");
        // Reset privacy acceptance when loading
        setPrivacyAccepted(false);
      } catch (error) {
        // If parsing fails, just continue with empty form
        console.error("Failed to parse pending order:", error);
      }
    }
  }, []);

  const handleTicketCountChange = (newCount: number) => {
    if (newCount < 1) return;

    setTicketCount(newCount);

    const diff = newCount - 1 - additionalNames.length;
    if (diff > 0) {
      setAdditionalNames([...additionalNames, ...Array(diff).fill("")]);
    } else if (diff < 0) {
      setAdditionalNames(additionalNames.slice(0, newCount - 1));
    }
  };

  const handleAdditionalNameChange = (index: number, value: string) => {
    const newNames = [...additionalNames];
    newNames[index] = value;
    setAdditionalNames(newNames);
  };

  const handleRemoveTicket = (index: number) => {
    // Set the removing index to trigger animation
    setRemovingIndex(index);

    // Wait for animation to complete before actually removing
    setTimeout(() => {
      const newNames = additionalNames.filter((_, i) => i !== index);
      setAdditionalNames(newNames);
      setTicketCount(newNames.length + 1); // +1 for the main ticket
      setRemovingIndex(null);
    }, 300); // Match the animation duration
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!privacyAccepted) {
      alert(
        "Je moet akkoord gaan met de privacyvoorwaarden om verder te gaan."
      );
      return;
    }

    // Check if all additional names are filled
    if (!allNamesFilledIn) {
      alert("Vul alle namen in voor de extra tickets om verder te gaan.");
      return;
    }

    setIsSubmitting(true);

    // Simulate processing delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Store order data in sessionStorage to pass to confirmation page
    const orderData = {
      name,
      email,
      ticketCount,
      additionalNames: additionalNames,
      organization,
      referer: referer !== "general" ? referer : null,
      paymentMethod,
      totalPrice,
    };

    sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));

    // Navigate to confirmation page
    router.push(`/${referer}/bevestiging/preview`);
  };

  return (
    <>
      <style jsx>{`
        @keyframes slideOutLeft {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-100%);
            opacity: 0;
          }
        }

        .removing {
          animation: slideOutLeft 300ms ease-in forwards;
        }
      `}</style>

      <Card className="shadow-2xl border-2 relative overflow-hidden backdrop-blur">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

        <CardHeader className="relative space-y-3 pb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Bestel je tickets
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            Vul je gegevens in en kies hoeveel tickets je wilt bestellen
          </CardDescription>
        </CardHeader>

        <CardContent className="relative">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Name field */}
            <div className="space-y-2 group">
              <Label
                htmlFor="name"
                className="text-base font-medium flex items-center gap-2"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Jouw naam <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Volledige naam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Email field */}
            <div className="space-y-2 group">
              <Label
                htmlFor="email"
                className="text-base font-medium flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email adres <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jouw@email.be"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Organization field (optional) */}
            <div className="space-y-2 group">
              <Label
                htmlFor="organization"
                className="text-base font-medium flex items-center gap-2"
              >
                <Users className="h-4 w-4 text-muted-foreground" />
                Organisatie{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (optioneel)
                </span>
              </Label>
              <Input
                id="organization"
                type="text"
                placeholder="Naam van je organisatie"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="h-12 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Ticket count */}
            <div className="space-y-4">
              <Label className="text-base font-medium flex items-center gap-2">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                Aantal tickets <span className="text-destructive">*</span>
              </Label>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-xl border-2 border-primary/20">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleTicketCountChange(ticketCount - 1)}
                    disabled={ticketCount <= 1}
                    className="h-12 w-12 border-2"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <div className="flex-1 text-center bg-background rounded-lg py-4 border-2">
                    <div className="text-5xl font-bold">{ticketCount}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      ticket{ticketCount !== 1 && "s"}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleTicketCountChange(ticketCount + 1)}
                    className="h-12 w-12 border-2"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2 border-primary/20">
                  <span className="text-sm font-medium">
                    €{TICKET_PRICE} per ticket
                  </span>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Totaal</div>
                    <div className="text-2xl font-bold">€{totalPrice}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* All ticket names */}
            {ticketCount >= 1 && (
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Tickets overzicht
                </Label>
                <p className="text-sm text-muted-foreground">
                  Vul de naam in voor elk ticket
                </p>

                <div className="space-y-3">
                  {/* Ticket 1 - Main person (disabled, synced with main name) */}
                  <div
                    className="flex items-center gap-3 animate-in slide-in-from-left duration-300 fade-in"
                    style={{ animationFillMode: "both" }}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                      1
                    </div>
                    <Input
                      type="text"
                      value={name}
                      disabled
                      placeholder="Je eigen naam (vul hierboven in)"
                      className="flex-1 h-12 text-base bg-muted border-2"
                    />
                  </div>

                  {/* Additional tickets */}
                  {additionalNames.map((additionalName, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 ${
                        removingIndex === index
                          ? "removing"
                          : "animate-in slide-in-from-left duration-300 fade-in"
                      }`}
                      style={{
                        animationDelay:
                          removingIndex === index
                            ? "0ms"
                            : `${(index + 1) * 50}ms`,
                        animationFillMode: "both",
                      }}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                        {index + 2}
                      </div>
                      <div className="flex-1 relative">
                        <Input
                          type="text"
                          value={additionalName}
                          onChange={(e) =>
                            handleAdditionalNameChange(index, e.target.value)
                          }
                          placeholder="Volledige naam *"
                          required
                          className={`h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                            additionalName.trim() === ""
                              ? "border-orange-300 dark:border-orange-700"
                              : ""
                          }`}
                          disabled={removingIndex === index}
                        />
                        {additionalName.trim() === "" && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive text-sm">
                            *
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTicket(index)}
                        disabled={removingIndex !== null}
                        className="h-12 w-12 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110"
                        title="Verwijder ticket"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment info */}
            <div className="space-y-4 pt-4 border-t-2">
              <div className="p-6 rounded-xl border-2 border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-base mb-1">
                      Betaling via bankoverschrijving
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Na het plaatsen van je bestelling ontvang je de
                      betalingsgegevens per email.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Notice with Checkbox */}
            <div className="space-y-3 pt-4">
              <div className="flex gap-3 p-4 bg-muted/50 rounded-lg border-2 border-muted">
                <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-sm font-semibold">
                      Privacy & gegevensbescherming
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Je gegevens worden uitsluitend gebruikt voor het verwerken
                      van je bestelling (betaalbevestigingen, tickets en
                      betalingsherinneringen). Deze worden enkel bewaard en
                      ingezien door leden van Tram44 en worden niet gedeeld met
                      derden.
                    </p>
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-start gap-3 pt-2 border-t border-muted-foreground/20">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                    />
                    <label
                      htmlFor="privacy"
                      className="text-sm cursor-pointer select-none"
                    >
                      Ik ga akkoord met bovenstaande privacyvoorwaarden{" "}
                      <span className="text-destructive">*</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !canSubmit}
              className="w-full text-base h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/80 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Verwerken...
                </>
              ) : (
                <>
                  <Ticket className="h-5 w-5 mr-2" />
                  Controleer bestelling
                </>
              )}
            </Button>

            {(!privacyAccepted || !allNamesFilledIn) && (
              <div className="text-xs text-center space-y-1">
                {!privacyAccepted && (
                  <p className="text-muted-foreground">
                    ⚠️ Je moet akkoord gaan met de privacyvoorwaarden
                  </p>
                )}
                {!allNamesFilledIn && additionalNames.length > 0 && (
                  <p className="text-muted-foreground">
                    ⚠️ Vul alle namen in voor de extra tickets
                  </p>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </>
  );
}
