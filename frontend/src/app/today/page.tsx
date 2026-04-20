import { redirect } from "next/navigation";
import { todayKST } from "@/lib/dateUtils";

export default function Today() {
  const date = todayKST();
  redirect(`/${date}`);
}
