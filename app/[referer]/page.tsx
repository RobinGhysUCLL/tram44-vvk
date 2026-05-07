import { redirect } from "next/navigation";
import { PromotionBanner } from "@/components/promotionbanner";
import { TicketForm } from "@/components/ticket-form";
import { isSalesClosed } from "@/lib/config";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ referer: string }>;
}) {
  if (isSalesClosed()) {
    redirect("/gesloten");
  }
  
  const { referer } = await params;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">
            Club44 2026
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Bestel je tickets voor het evenement van het jaar
          </p>
        </div>
        <div className="mb-8">
          <PromotionBanner />
        </div>
        <TicketForm referer={referer} />
      </div>
    </div>
  );
}
