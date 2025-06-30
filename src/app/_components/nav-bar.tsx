"use client";

import Link from "next/link";
import * as React from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { cn } from "@/lib/utils";

export default function NavBar() {
  return (
    <div className="w-full">
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
          <NavigationMenuItem className="hidden sm:block">
            <NavigationMenuTrigger>Einkauf</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[500px] gap-3 p-2 lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="rounded-base flex h-full w-full flex-col justify-end p-6 no-underline outline-hidden select-none"
                      href="https://ui.shadcn.com"
                    >
                      <div className="font-heading mt-4 mb-2 text-lg">
                        shadcn/ui
                      </div>
                      <p className="font-base text-sm leading-tight">
                        Beautifully designed components that you can copy and
                        paste into your apps. Accessible. Customizable. Open
                        Source.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ListItem
                  href="https://ui.shadcn.com/docs"
                  title="Introduction"
                >
                  Re-usable components built using Radix UI and Tailwind CSS.
                </ListItem>
                <ListItem
                  href="https://ui.shadcn.com/docs/installation"
                  title="Installation"
                >
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem
                  href="https://ui.shadcn.com/docs/primitives/typography"
                  title="Typography"
                >
                  Styles for headings, paragraphs, lists...etc
                </ListItem>
              </ul>
            </NavigationMenuContent>
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
