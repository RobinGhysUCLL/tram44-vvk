import { redirect } from "next/navigation";
import { isSalesClosed } from "@/lib/config";

export default function HomePage() {
  if (isSalesClosed()) {
    redirect("/gesloten");
  }
  
  redirect("/tram44");
}
