import { redirect } from "next/navigation";
import ProgressClient from "./ProgressClient";

// Hidden from production — dev only.
// Redirect before the client component loads so beta users never see it.
export default function ProgressPage() {
  if (process.env.NODE_ENV === "production") {
    redirect("/home");
  }

  return <ProgressClient />;
}
