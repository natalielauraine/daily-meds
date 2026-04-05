// /privacy redirects to the canonical privacy policy page at /privacy-policy
import { redirect } from "next/navigation";

export default function PrivacyRedirect() {
  redirect("/privacy-policy");
}
