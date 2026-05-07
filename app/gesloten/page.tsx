"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Ticket, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GeslotenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 mb-4">
            <Clock className="h-12 w-12 text-amber-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-amber-600">
            Online verkoop gesloten
          </h1>
          <p className="text-lg text-muted-foreground">
            De online ticketverkoop voor Club44 2026 is afgelopen
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-2 border-amber-200 mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Ticket className="h-6 w-6 text-amber-600" />
              Tickets aan de kassa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-base text-foreground">
                Je kan nog steeds tickets kopen, maar enkel nog aan de kassa op
                het evenement zelf.
              </p>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold text-foreground">
                      Jeugdhuis Tram44
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Oppemstraat 57
                      <br />
                      3080 Tervuren
                    </p>
                    <div className="pt-2">
                      <p className="text-sm font-medium text-foreground">
                        📅 Donderdag 13 februari 2026
                      </p>
                      <p className="text-sm text-muted-foreground">
                        🕘 Evenement start: 21:00
                      </p>
                      <p className="text-sm text-muted-foreground">
                        🎫 Kassa open tot: 03:00
                      </p>
                    </div>
                    <a
                      href="https://www.google.com/maps/place/Jeugdhuis+Tram44/@50.8293179,4.5040039,17z/data=!3m1!4b1!4m6!3m5!1s0x47c3d958635dfef1:0x3360c2a9a46a3424!8m2!3d50.8293145!4d4.5065788!16s%2Fg%2F11f01v6dqz?entry=ttu&g_ep=EgoyMDI2MDIxMC4wIKXMDSoASAFQAw%3D%3D"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium pt-2"
                    >
                      📍 Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div className="rounded-lg overflow-hidden border border-amber-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2517.8698989872843!2d4.5040039!3d50.8293179!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3d958635dfef1%3A0x3360c2a9a46a3424!2sJeugdhuis%20Tram44!5e0!3m2!1snl!2sbe!4v1707850000000!5m2!1snl!2sbe"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  Ticket prijs aan de kassa:
                </h3>
                <p className="text-2xl font-bold text-amber-600">
                  €5 per ticket
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3 text-foreground">
                Waarom is de online verkoop gesloten?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>
                    De deadline voor online bestellingen is verstreken
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>
                    We willen voldoende tijd hebben om alle betalingen te
                    verwerken
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Tickets zijn nog steeds beschikbaar aan de kassa</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Vragen?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Heb je nog vragen over je bestelling of het evenement? Neem dan
              contact met ons op via onze social media:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://www.facebook.com/jhtervuren"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </a>
              <a
                href="https://www.instagram.com/jhtram44/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Instagram
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
