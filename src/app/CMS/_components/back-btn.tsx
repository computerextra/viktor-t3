"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BackBtn({ href }: { href?: string }) {
  return (
    <Button variant={"default"} asChild>
      <Link href={href ?? "/CMS"}>Zurück</Link>
    </Button>
  );
}
