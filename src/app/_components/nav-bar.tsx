"use client";

import Link from "next/link";
import * as React from "react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { cn } from "@/lib/utils";

export default function NavBar() {
  return (
    <div className="w-full print:hidden">
      <NavigationMenu className="z-5 mx-auto">
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link
              href="/"
              className={cn(
                "hover:bg-accent text-main-foreground rounded-base hover:border-border block space-y-1 border-2 border-transparent p-3 leading-none no-underline outline-hidden transition-colors select-none",
                navigationMenuTriggerStyle(),
              )}
            >
              Start
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              href="/Einkauf"
              className={cn(
                "hover:bg-accent text-main-foreground rounded-base hover:border-border block space-y-1 border-2 border-transparent p-3 leading-none no-underline outline-hidden transition-colors select-none",
                navigationMenuTriggerStyle(),
              )}
            >
              Einkauf
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link
              href="/Archiv"
              className={cn(
                "hover:bg-accent text-main-foreground rounded-base hover:border-border block space-y-1 border-2 border-transparent p-3 leading-none no-underline outline-hidden transition-colors select-none",
                navigationMenuTriggerStyle(),
              )}
            >
              CE Archiv
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              href="/Warenlieferung"
              className={cn(
                "hover:bg-accent text-main-foreground rounded-base hover:border-border block space-y-1 border-2 border-transparent p-3 leading-none no-underline outline-hidden transition-colors select-none",
                navigationMenuTriggerStyle(),
              )}
            >
              Warenlieferung
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              href="/CMS"
              className={cn(
                "hover:bg-accent text-main-foreground rounded-base hover:border-border block space-y-1 border-2 border-transparent p-3 leading-none no-underline outline-hidden transition-colors select-none",
                navigationMenuTriggerStyle(),
              )}
            >
              CMS
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

function ListItem({
  className,
  title,
  children,
  ...props
}: React.ComponentProps<"a">) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "hover:bg-accent text-main-foreground rounded-base hover:border-border block space-y-1 border-2 border-transparent p-3 leading-none no-underline outline-hidden transition-colors select-none",
            className,
          )}
          {...props}
        >
          <div className="font-heading text-base leading-none">{title}</div>
          <p className="font-base line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
}
ListItem.displayName = "ListItem";
