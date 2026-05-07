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
import {
  CheckCircle2,
  Copy,
  Home,
  FileDown,
  CreditCard,
  Ticket,
} from "lucide-react";
import { fetchOrderById } from "@/lib/utils";
import { Order } from "@/lib/orders";
import pdfMake from "pdfmake/build/pdfmake";
// @ts-ignore - vfs_fonts doesn't have proper types
import pdfFonts from "pdfmake/build/vfs_fonts";

// Set fonts for pdfMake
// @ts-ignore
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

const TICKET_PRICE = 3;
const BANK_ACCOUNT = "BE83 0018 0751 8915";

export default function SuccessPage({
  params,
}: {
  params: Promise<{ referer: string; orderId: string }>;
}) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{
    referer: string;
    orderId: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedBankAccount, setCopiedBankAccount] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const p = await params;
      setResolvedParams(p);

      try {
        const foundOrder = await fetchOrderById(p.orderId);
        if (!foundOrder) {
          router.push(`/${p.referer}`);
          return;
        }
        setOrder(foundOrder);
      } catch (error) {
        console.error("Failed to load order:", error);
        router.push(`/${p.referer}`);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [params, router]);

  const handleCopy = async () => {
    if (order?.id) {
      try {
        const message = `Club44 2026 - ${order.name} - ${order.ticketCount} ${
          order.ticketCount === 1 ? "ticket" : "tickets"
        }`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(message);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = message;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand("copy");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (err) {
            console.error("Fallback copy failed:", err);
            alert("Kopiëren mislukt. Kopieer de mededeling handmatig.");
          }
          document.body.removeChild(textArea);
        }
      } catch (err) {
        console.error("Failed to copy:", err);
        alert("Kopiëren mislukt. Kopieer de mededeling handmatig.");
      }
    }
  };

  const handleCopyBankAccount = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(BANK_ACCOUNT);
        setCopiedBankAccount(true);
        setTimeout(() => setCopiedBankAccount(false), 2000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = BANK_ACCOUNT;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          setCopiedBankAccount(true);
          setTimeout(() => setCopiedBankAccount(false), 2000);
        } catch (err) {
          console.error("Fallback copy failed:", err);
          alert("Kopiëren mislukt. Kopieer het rekeningnummer handmatig.");
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Kopiëren mislukt. Kopieer het rekeningnummer handmatig.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!order) return;

    setIsGeneratingPDF(true);

    try {
      const ticketsList = [
        { name: order.name, number: 1 },
        ...order.additionalNames.map((name: string, idx: number) => ({
          name: name || `Ticket ${idx + 2}`,
          number: idx + 2,
        })),
      ];

      const docDefinition: any = {
        pageSize: "A4",
        pageMargins: [40, 60, 40, 60],
        content: [
          {
            text: "Bestelling betaald!",
            style: "header",
            alignment: "center",
            margin: [0, 0, 0, 10],
          },
          {
            text: "Je tickets zijn definitief gereserveerd",
            style: "subheader",
            alignment: "center",
            margin: [0, 0, 0, 30],
          },
          {
            text: "Besteldetails",
            style: "sectionHeader",
            margin: [0, 0, 0, 15],
          },
          {
            text: `Order ID: ${order.id}`,
            style: "orderInfo",
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              {
                width: "50%",
                stack: [
                  { text: "Naam", style: "label" },
                  { text: order.name, style: "value", margin: [0, 0, 0, 15] },
                ],
              },
              {
                width: "50%",
                stack: [
                  { text: "Email", style: "label" },
                  { text: order.email, style: "value", margin: [0, 0, 0, 15] },
                ],
              },
            ],
          },
          ...(order.organization
            ? [
                {
                  stack: [
                    { text: "Organisatie", style: "label" },
                    {
                      text: order.organization,
                      style: "value",
                      margin: [0, 0, 0, 15],
                    },
                  ],
                },
              ]
            : []),
          {
            canvas: [
              {
                type: "line",
                x1: 0,
                y1: 0,
                x2: 515,
                y2: 0,
                lineWidth: 1,
                lineColor: "#e5e7eb",
              },
            ],
            margin: [0, 15, 0, 15],
          },
          {
            text: "Je tickets",
            style: "sectionHeader",
            margin: [0, 0, 0, 10],
          },
          ...ticketsList.map((ticket: any, idx: number) => ({
            columns: [
              {
                width: 40,
                text: `#${ticket.number}`,
                style: "ticketNumber",
              },
              {
                width: "*",
                text: ticket.name,
                style: "ticketName",
              },
            ],
            margin: [0, 0, 0, idx < ticketsList.length - 1 ? 8 : 0],
          })),
          {
            canvas: [
              {
                type: "line",
                x1: 0,
                y1: 0,
                x2: 515,
                y2: 0,
                lineWidth: 2,
                lineColor: "#16a34a",
              },
            ],
            margin: [0, 20, 0, 15],
          },
          {
            columns: [
              {
                width: "*",
                text: "Totaal bedrag",
                style: "totalLabel",
              },
              {
                width: "auto",
                text: `€${order.totalPrice}`,
                style: "totalAmount",
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            canvas: [
              {
                type: "line",
                x1: 0,
                y1: 0,
                x2: 515,
                y2: 0,
                lineWidth: 2,
                lineColor: "#16a34a",
              },
            ],
            margin: [0, 0, 0, 15],
          },
          {
            text: "Club44 2026",
            style: "footer",
            alignment: "center",
            margin: [0, 0, 0, 5],
          },
          {
            text: "Bewaar deze bevestiging voor je bezoek",
            style: "footerSmall",
            alignment: "center",
            margin: [0, 0, 0, 10],
          },
          {
            text: `Besteld op: ${new Date(order.timestamp).toLocaleDateString(
              "nl-BE",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
            )}`,
            style: "footerSmall",
            alignment: "center",
          },
        ],
        styles: {
          header: {
            fontSize: 24,
            bold: true,
            color: "#16a34a",
          },
          subheader: {
            fontSize: 14,
            color: "#6b7280",
          },
          sectionHeader: {
            fontSize: 16,
            bold: true,
            color: "#374151",
          },
          orderInfo: {
            fontSize: 12,
            color: "#6b7280",
          },
          label: {
            fontSize: 10,
            color: "#6b7280",
            margin: [0, 0, 0, 5],
          },
          value: {
            fontSize: 14,
            color: "#111827",
          },
          ticketNumber: {
            fontSize: 14,
            bold: true,
            color: "#16a34a",
          },
          ticketName: {
            fontSize: 14,
            color: "#374151",
          },
          totalLabel: {
            fontSize: 18,
            bold: true,
            color: "#111827",
          },
          totalAmount: {
            fontSize: 24,
            bold: true,
            color: "#16a34a",
          },
          footer: {
            fontSize: 14,
            bold: true,
            color: "#111827",
          },
          footerSmall: {
            fontSize: 10,
            color: "#6b7280",
          },
        },
        defaultStyle: {
          font: "Roboto",
        },
      };

      pdfMake
        .createPdf(docDefinition)
        .download(`Club44-2026-Order-${order.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Er ging iets mis bij het genereren van de PDF. Probeer opnieuw.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading || !order || !resolvedParams) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  const ticketsList = [
    { name: order.name, number: 1 },
    ...order.additionalNames.map((name: string, idx: number) => ({
      name: name || `Ticket ${idx + 2}`,
      number: idx + 2,
    })),
  ];

  const paymentMessage = `Club44 2026 - ${order.name} - ${order.ticketCount} ${
    order.ticketCount === 1 ? "ticket" : "tickets"
  }`;

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          body * {
            visibility: hidden;
          }

          .print-section,
          .print-section * {
            visibility: visible;
          }

          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Success Header - Mobile Optimized */}
          <div className="text-center mb-6 print-section">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/10 mb-4">
              <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-green-600">
              {order.paid
                ? "🎉 Bestelling betaald! 🎉"
                : "✨ Bestelling ontvangen! ✨"}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              {order.paid
                ? "Je tickets zijn definitief gereserveerd"
                : "Je tickets worden gereserveerd zodra we je betaling ontvangen"}
            </p>
          </div>

          {/* Order Details Card - Mobile First */}
          <Card className="border-2 border-green-200 mb-6 print-section">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
                <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 shrink-0" />
                <span className="truncate">Besteldetails</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm break-all">
                Order ID: {order.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Contact Info - Stack on mobile */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Naam</div>
                  <div className="font-semibold text-sm sm:text-base wrap-break-word">
                    {order.name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Email
                  </div>
                  <div className="font-semibold text-sm sm:text-base break-all">
                    {order.email}
                  </div>
                </div>
                {order.organization && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Organisatie
                    </div>
                    <div className="font-semibold text-sm sm:text-base wrap-break-word">
                      {order.organization}
                    </div>
                  </div>
                )}
              </div>

              {/* Tickets List */}
              <div className="border-t-2 pt-4 sm:pt-6">
                <div className="text-sm sm:text-base font-semibold text-muted-foreground mb-3">
                  Je tickets
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {ticketsList.map((ticket) => (
                    <div
                      key={ticket.number}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-600 text-white text-xs sm:text-sm font-bold shrink-0">
                        {ticket.number}
                      </div>
                      <div className="font-medium text-sm sm:text-base text-gray-900 wrap-break-word flex-1">
                        {ticket.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t-2 pt-4 sm:pt-6 flex justify-between items-center gap-4">
                <span className="text-base sm:text-lg md:text-xl font-bold ">
                  Totaal
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-green-600">
                  €{order.totalPrice}
                </span>
              </div>

              {/* Footer Info */}
              <div className="border-t-2 pt-4 sm:pt-6 text-center text-xs sm:text-sm text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Club44 2026</p>
                {order.paid && <p>Bewaar deze bevestiging voor je bezoek</p>}
                <p className="text-xs">
                  {order.paid ? "Besteld " : "Gereserveerd "}
                  op:{" "}
                  {new Date(order.timestamp).toLocaleDateString("nl-BE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Instructions - Mobile Optimized */}
          {!order.paid && (
            <Card className="border-2 mb-6 no-print">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <CreditCard className="h-5 w-5 shrink-0" />
                  <span>Betaalinstructies</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Maak je bestelling compleet door het bedrag over te schrijven:
                </p>

                <div className="bg-muted p-4 rounded-lg space-y-4">
                  {/* Amount */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Bedrag:</span>
                    <span className="text-lg sm:text-xl font-bold">
                      €{order.totalPrice}
                    </span>
                  </div>

                  {/* Bank Account */}
                  <div className="border-t pt-4 space-y-2">
                    <span className="text-sm font-medium block">
                      Rekeningnummer:
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <code className="flex-1 bg-background p-3 rounded text-sm border break-all">
                        {BANK_ACCOUNT}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyBankAccount}
                        className="w-full sm:w-auto shrink-0"
                      >
                        {copiedBankAccount ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Gekopieerd!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Kopieer
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Payment Message */}
                  <div className="border-t pt-4 space-y-2">
                    <span className="text-sm font-medium block">
                      Mededeling:
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <code className="flex-1 bg-background p-3 rounded text-xs sm:text-sm border break-all">
                        {paymentMessage}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="w-full sm:w-auto shrink-0"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Gekopieerd!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Kopieer
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 space-y-2 ">
                    <strong>Let op:</strong>
                    <ul className="list-disc ml-4 mt-2 space-y-1">
                      <li>
                        Gebruik exact deze mededeling zodat we je betaling
                        kunnen koppelen aan je bestelling.
                      </li>
                      <li>
                        Het bevestigen van betalingen gebeurt handmatig, het kan
                        dus even duren voordat je bestelling is verwerkt.
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex flex-col gap-3 no-print">
            {order.paid && (
              <Button
                size="lg"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="w-full h-12 bg-linear-to-r from-primary to-primary/80"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="ml-2">PDF genereren...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="h-5 w-5" />
                    <span className="ml-2">Download tickets (PDF)</span>
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/")}
              className="w-full h-12 border-2"
            >
              <Home className="h-5 w-5 mr-2" />
              Terug naar startpagina
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
