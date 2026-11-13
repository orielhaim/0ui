"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { ChevronDown, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  MotionNavigationMenu,
  MotionNavigationMenuContent,
  MotionNavigationMenuItem,
  MotionNavigationMenuLink,
  MotionNavigationMenuList,
  MotionNavigationMenuTrigger,
} from "./motion-navigation-menu";

const spring = { type: "spring" as const, stiffness: 240, damping: 28 };
const panelTransition = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };

const elevatedShadow =
  "inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 18px 40px -20px rgba(0, 0, 0, 0.9)";

const desktopItemClassName =
  "h-9 flex-row items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium text-neutral-300 transition-colors hover:text-white focus-visible:ring-white/20 data-[state=open]:bg-white/10 data-[state=open]:text-white";

const buttonVariants = {
  primary: "bg-white text-neutral-950 hover:bg-neutral-200",
  secondary:
    "border border-white/10 bg-white/5 text-neutral-100 hover:border-white/20 hover:bg-white/10",
  ghost: "text-neutral-400 hover:bg-white/5 hover:text-white",
  accent: "bg-orange-400 text-neutral-950 hover:bg-orange-300",
} as const;

type NavbarButtonVariant = keyof typeof buttonVariants;

type NavbarLink = {
  label: React.ReactNode;
  href?: string;
  value?: string;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  as?: React.ElementType;
};

type NavbarItem = NavbarLink & {
  content?: React.ReactNode;
  items?: NavbarLink[];
  dropdownClassName?: string;
};

type NavbarProps = Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
  brand?: React.ReactNode;
  items?: NavbarItem[];
  actions?: React.ReactNode;
  mobileFooter?: React.ReactNode;
  position?: "sticky" | "fixed";
  /** Shrink the bar into a floating pill after scroll. */
  resizable?: boolean;
  elevatedAfter?: number;
  linkAs?: React.ElementType;
  onNavigate?: (event: React.MouseEvent) => void;
  containerClassName?: string;
  desktopClassName?: string;
  mobileClassName?: string;
};

function getItemValue(item: NavbarLink, index: number) {
  return item.value ?? item.href ?? `nav-item-${index}`;
}

function hasDropdown(item: NavbarItem) {
  return Boolean(item.content) || Boolean(item.items?.length);
}

function Navbar({
  brand,
  items = [],
  actions,
  mobileFooter,
  position = "sticky",
  resizable = true,
  elevatedAfter = 16,
  linkAs: LinkComponent = "a",
  onNavigate,
  className,
  containerClassName,
  desktopClassName,
  mobileClassName,
  ...props
}: NavbarProps) {
  const [elevated, setElevated] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const mobileRef = React.useRef<HTMLDivElement>(null);
  const panelId = React.useId();
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const shellTransition = reduceMotion ? { duration: 0 } : spring;
  const compact = resizable && elevated;

  useMotionValueEvent(scrollY, "change", (value) => {
    setElevated(value > elevatedAfter);
  });

  React.useEffect(() => {
    setElevated(window.scrollY > elevatedAfter);
  }, [elevatedAfter]);

  const handleNavigate = React.useCallback(
    (event: React.MouseEvent) => {
      setMobileOpen(false);
      onNavigate?.(event);
    },
    [onNavigate],
  );

  React.useEffect(() => {
    if (!mobileOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        mobileRef.current &&
        event.target instanceof Node &&
        !mobileRef.current.contains(event.target)
      ) {
        setMobileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const query = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileOpen(false);
      }
    };

    query.addEventListener("change", handleChange);

    return () => query.removeEventListener("change", handleChange);
  }, []);

  const surface = {
    backgroundColor: elevated ? "rgba(10, 10, 10, 0.72)" : "rgba(10, 10, 10, 0)",
    borderColor: elevated
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(255, 255, 255, 0)",
    boxShadow: elevated ? elevatedShadow : "none",
    backdropFilter: elevated ? "blur(18px)" : "blur(0px)",
  };

  const mobileSurface = {
    ...surface,
    backgroundColor:
      elevated || mobileOpen ? "rgba(10, 10, 10, 0.88)" : "rgba(10, 10, 10, 0)",
    borderColor:
      elevated || mobileOpen
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(255, 255, 255, 0)",
    boxShadow: elevated || mobileOpen ? elevatedShadow : "none",
    backdropFilter: elevated || mobileOpen ? "blur(18px)" : "blur(0px)",
  };

  return (
    <div
      className={cn(
        position === "fixed" ? "fixed" : "sticky",
        "inset-x-0 top-0 z-50 pt-3",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-7xl px-4 sm:px-6",
          containerClassName,
        )}
      >
        <motion.div
          initial={false}
          animate={{
            ...surface,
            width: compact ? "72%" : "100%",
            y: compact ? 10 : 0,
          }}
          transition={shellTransition}
          style={resizable ? { minWidth: "min(100%, 54rem)" } : undefined}
          className={cn(
            "relative mx-auto hidden h-14 items-center rounded-full border px-3 lg:grid lg:grid-cols-[1fr_auto_1fr]",
            desktopClassName,
          )}
        >
          <div className="flex min-w-0 items-center justify-self-start ps-2">
            {brand}
          </div>

          <div className="justify-self-center">
            <MotionNavigationMenu aria-label="Main">
              <MotionNavigationMenuList
                className="gap-0.5"
                highlightClassName="rounded-full bg-white/10"
              >
                {items.map((item, index) => (
                  <DesktopNavItem
                    key={getItemValue(item, index)}
                    item={item}
                    index={index}
                    linkAs={LinkComponent}
                    onNavigate={handleNavigate}
                  />
                ))}
              </MotionNavigationMenuList>
            </MotionNavigationMenu>
          </div>

          <div className="flex items-center justify-self-end gap-1.5">
            {actions}
          </div>
        </motion.div>

        <motion.div
          ref={mobileRef}
          initial={false}
          animate={{
            ...mobileSurface,
            width: compact ? "94%" : "100%",
            y: compact ? 8 : 0,
          }}
          transition={shellTransition}
          className={cn(
            "mx-auto flex flex-col overflow-hidden rounded-3xl border lg:hidden",
            mobileClassName,
          )}
        >
          <div className="flex h-14 items-center justify-between gap-3 px-4">
            <div className="min-w-0">{brand}</div>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls={panelId}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-300 transition-colors hover:text-white"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  key={mobileOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -70, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 70, scale: 0.7 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18 }}
                  className="inline-flex"
                >
                  {mobileOpen ? (
                    <X className="size-4" />
                  ) : (
                    <Menu className="size-4" />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {mobileOpen && (
              <motion.div
                id={panelId}
                key="mobile-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={reduceMotion ? { duration: 0 } : panelTransition}
                className="overflow-hidden"
              >
                <div className="max-h-[min(70dvh,32rem)] overflow-y-auto overscroll-contain border-t border-white/10 px-2 pt-2 pb-3">
                  <ul className="flex flex-col gap-0.5">
                    {items.map((item, index) => (
                      <MobileNavItem
                        key={getItemValue(item, index)}
                        item={item}
                        linkAs={LinkComponent}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </ul>

                  {(actions || mobileFooter) && (
                    <div className="mt-2 flex flex-col gap-2 border-t border-white/10 px-2 pt-3">
                      {actions ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {actions}
                        </div>
                      ) : null}
                      {mobileFooter}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function DesktopNavItem({
  item,
  index,
  linkAs: LinkComponent,
  onNavigate,
}: {
  item: NavbarItem;
  index: number;
  linkAs: React.ElementType;
  onNavigate: (event: React.MouseEvent) => void;
}) {
  const value = getItemValue(item, index);

  if (!hasDropdown(item)) {
    return (
      <MotionNavigationMenuItem value={value}>
        <MotionNavigationMenuLink
          as={item.as ?? LinkComponent}
          href={item.href}
          onClick={onNavigate}
          className={cn(desktopItemClassName, item.className)}
        >
          {item.icon ? (
            <span className="[&_svg]:size-4">{item.icon}</span>
          ) : null}
          {item.label}
        </MotionNavigationMenuLink>
      </MotionNavigationMenuItem>
    );
  }

  return (
    <MotionNavigationMenuItem value={value}>
      <MotionNavigationMenuTrigger
        className={cn(desktopItemClassName, item.className)}
      >
        {item.label}
      </MotionNavigationMenuTrigger>

      <MotionNavigationMenuContent
        className={cn("p-2", item.dropdownClassName)}
        highlightClassName="rounded-xl bg-white/10"
        innerClassName={cn(
          item.items?.length && "grid w-[30rem] grid-cols-2 gap-1",
        )}
      >
        {item.content ??
          item.items?.map((entry, entryIndex) => (
            <NavbarMenuCard
              key={entry.href ?? `${value}-${entryIndex}`}
              item={entry}
              linkAs={LinkComponent}
              onNavigate={onNavigate}
            />
          ))}
      </MotionNavigationMenuContent>
    </MotionNavigationMenuItem>
  );
}

function NavbarMenuCard({
  item,
  linkAs: LinkComponent,
  onNavigate,
}: {
  item: NavbarLink;
  linkAs: React.ElementType;
  onNavigate: (event: React.MouseEvent) => void;
}) {
  return (
    <MotionNavigationMenuLink
      as={item.as ?? LinkComponent}
      href={item.href}
      onClick={onNavigate}
      className="group/card flex-row items-start gap-3 rounded-xl p-3"
    >
      {item.icon ? (
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-neutral-200 transition-colors group-hover/card:border-white/20 group-hover/card:text-white [&_svg]:size-4">
          {item.icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-neutral-100">
          {item.label}
        </span>
        {item.description ? (
          <span className="text-xs leading-relaxed text-neutral-400">
            {item.description}
          </span>
        ) : null}
      </span>
    </MotionNavigationMenuLink>
  );
}

function MobileNavItem({
  item,
  linkAs: LinkComponent,
  onNavigate,
}: {
  item: NavbarItem;
  linkAs: React.ElementType;
  onNavigate: (event: React.MouseEvent) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const reduceMotion = useReducedMotion();
  const ItemLink = item.as ?? LinkComponent;

  if (!hasDropdown(item)) {
    return (
      <li>
        <ItemLink
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white",
            item.className,
          )}
        >
          {item.icon ? (
            <span className="text-neutral-400 [&_svg]:size-4">{item.icon}</span>
          ) : null}
          {item.label}
        </ItemLink>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
      >
        <span className="flex items-center gap-2">
          {item.icon ? (
            <span className="text-neutral-400 [&_svg]:size-4">{item.icon}</span>
          ) : null}
          {item.label}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-neutral-500 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : panelTransition}
            className="overflow-hidden"
          >
            <div className="ms-4 mb-1 flex flex-col gap-0.5 border-s border-white/10 ps-2">
              {item.content ??
                item.items?.map((entry, entryIndex) => {
                  const EntryLink = entry.as ?? LinkComponent;

                  return (
                    <EntryLink
                      key={entry.href ?? `${String(item.label)}-${entryIndex}`}
                      href={entry.href}
                      onClick={onNavigate}
                      className="flex flex-col gap-0.5 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <span>{entry.label}</span>
                      {entry.description ? (
                        <span className="text-xs leading-relaxed text-neutral-500">
                          {entry.description}
                        </span>
                      ) : null}
                    </EntryLink>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

type NavbarButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  as?: React.ElementType;
  variant?: NavbarButtonVariant;
  href?: string;
};

function NavbarButton({
  as: Tag = "button",
  variant = "secondary",
  className,
  ...props
}: NavbarButtonProps) {
  return (
    <Tag
      type={Tag === "button" ? "button" : undefined}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/30",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Navbar, NavbarButton };
export type { NavbarItem, NavbarLink, NavbarProps };
