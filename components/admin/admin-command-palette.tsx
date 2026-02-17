"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CommandSection = "cms" | "management" | "content";

type CommandItemLabels = {
  label: string;
  description: string;
  keywords: string;
};

export type AdminCommandPaletteLabels = {
  hotkeyHint: string;
  dialogTitle: string;
  dialogDescription: string;
  searchPlaceholder: string;
  emptyState: string;
  selectHint: string;
  sections: Record<CommandSection, string>;
  routes: {
    dashboard: CommandItemLabels;
    cars: CommandItemLabels;
    bookings: CommandItemLabels;
    homepageSlider: CommandItemLabels;
    content: CommandItemLabels;
    i18n: CommandItemLabels;
  };
};

type AdminCommandPaletteProps = {
  isAdmin: boolean;
  labels: AdminCommandPaletteLabels | null;
};

type CommandItem = {
  id: string;
  href: string;
  section: CommandSection;
  label: string;
  description: string;
  keywords: string[];
};

type GroupedCommand = {
  command: CommandItem;
  index: number;
};

function normalizeSearchValue(value: string) {
  return value.toLowerCase().trim();
}

function parseKeywords(value: string) {
  return value
    .split(",")
    .map((entry) => normalizeSearchValue(entry))
    .filter(Boolean);
}

function matchesFuzzyToken(haystack: string, token: string) {
  if (haystack.includes(token)) {
    return true;
  }

  let tokenIndex = 0;

  for (const character of haystack) {
    if (character === token[tokenIndex]) {
      tokenIndex += 1;
    }

    if (tokenIndex === token.length) {
      return true;
    }
  }

  return false;
}

export function AdminCommandPalette({ isAdmin, labels }: AdminCommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useHotkeys(
    "meta+shift+k, ctrl+shift+k",
    (event) => {
      if (!isAdmin) {
        return;
      }

      event.preventDefault();
      setQuery("");
      setSelectedIndex(0);
      setIsOpen(true);
    },
    {
      enabled: isAdmin,
      preventDefault: true,
      enableOnFormTags: false,
      enableOnContentEditable: false,
    },
    [isAdmin],
  );

  useHotkeys(
    "escape",
    () => {
      setIsOpen(false);
      setQuery("");
      setSelectedIndex(0);
    },
    { enabled: isAdmin && isOpen },
    [isAdmin, isOpen],
  );

  const commands = useMemo<CommandItem[]>(() => {
    if (!labels) {
      return [];
    }

    return [
      {
        id: "dashboard",
        href: "/admin",
        section: "cms",
        label: labels.routes.dashboard.label,
        description: labels.routes.dashboard.description,
        keywords: parseKeywords(labels.routes.dashboard.keywords),
      },
      {
        id: "bookings",
        href: "/admin/bookings",
        section: "management",
        label: labels.routes.bookings.label,
        description: labels.routes.bookings.description,
        keywords: parseKeywords(labels.routes.bookings.keywords),
      },
      {
        id: "cars",
        href: "/admin/cars",
        section: "management",
        label: labels.routes.cars.label,
        description: labels.routes.cars.description,
        keywords: parseKeywords(labels.routes.cars.keywords),
      },
      {
        id: "homepage-slider",
        href: "/admin/homepage-slider",
        section: "content",
        label: labels.routes.homepageSlider.label,
        description: labels.routes.homepageSlider.description,
        keywords: parseKeywords(labels.routes.homepageSlider.keywords),
      },
      {
        id: "content",
        href: "/admin/content",
        section: "content",
        label: labels.routes.content.label,
        description: labels.routes.content.description,
        keywords: parseKeywords(labels.routes.content.keywords),
      },
      {
        id: "i18n",
        href: "/admin/i18n",
        section: "content",
        label: labels.routes.i18n.label,
        description: labels.routes.i18n.description,
        keywords: parseKeywords(labels.routes.i18n.keywords),
      },
    ];
  }, [labels]);

  const filteredCommands = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);

    if (!normalizedQuery) {
      return commands;
    }

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

    return commands.filter((command) => {
      const searchableValue = normalizeSearchValue(`${command.label} ${command.description} ${command.keywords.join(" ")}`);
      return tokens.every((token) => matchesFuzzyToken(searchableValue, token));
    });
  }, [commands, query]);

  const groupedCommands = useMemo<Record<CommandSection, GroupedCommand[]>>(() => {
    const grouped: Record<CommandSection, GroupedCommand[]> = {
      cms: [],
      management: [],
      content: [],
    };

    filteredCommands.forEach((command, index) => {
      grouped[command.section].push({ command, index });
    });

    return grouped;
  }, [filteredCommands]);

  const activeIndex = filteredCommands.length === 0 ? -1 : Math.min(selectedIndex, filteredCommands.length - 1);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const selectedButton = listRef.current?.querySelector<HTMLButtonElement>(`[data-command-index="${activeIndex}"]`);
    selectedButton?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  const sectionOrder: CommandSection[] = ["cms", "management", "content"];

  const selectCommand = (command: CommandItem) => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
    router.push(command.href);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (filteredCommands.length > 0) {
        setSelectedIndex((current) => (current + 1) % filteredCommands.length);
      }

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (filteredCommands.length > 0) {
        setSelectedIndex((current) => (current - 1 + filteredCommands.length) % filteredCommands.length);
      }

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selected = activeIndex >= 0 ? filteredCommands[activeIndex] : undefined;

      if (selected) {
        selectCommand(selected);
      }
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setIsOpen(false);
      setQuery("");
      setSelectedIndex(0);
      return;
    }

    setQuery("");
    setSelectedIndex(0);
    setIsOpen(true);
  };

  if (!isAdmin || !labels) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-2xl gap-3 rounded-2xl border border-border bg-background p-4 shadow-2xl sm:p-5">
        <DialogHeader className="gap-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="font-display text-xl leading-tight font-semibold">{labels.dialogTitle}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">{labels.dialogDescription}</DialogDescription>
            </div>
            <span className="rounded-md border border-border px-2 py-1 text-[11px] leading-none text-muted-foreground">
              {labels.hotkeyHint}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder={labels.searchPlaceholder}
              className="h-11 pl-9"
            />
          </div>

          <p className="text-xs text-muted-foreground">{labels.selectHint}</p>

          <div ref={listRef} className="max-h-[60vh] overflow-y-auto rounded-xl border border-border/70 bg-card p-2">
            {filteredCommands.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">{labels.emptyState}</p>
            ) : (
              sectionOrder.map((section) => {
                const group = groupedCommands[section];

                if (group.length === 0) {
                  return null;
                }

                return (
                  <section key={section} className="mb-2 last:mb-0">
                    <h3 className="px-2 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {labels.sections[section]}
                    </h3>
                    <div className="space-y-1">
                      {group.map(({ command, index }) => {
                        const isSelected = index === activeIndex;

                        return (
                          <button
                            key={command.id}
                            type="button"
                            data-command-index={index}
                            onMouseEnter={() => setSelectedIndex(index)}
                            onClick={() => selectCommand(command)}
                            className={cn(
                              "w-full rounded-lg border px-3 py-2 text-left transition",
                              isSelected
                                ? "border-primary/40 bg-primary/10"
                                : "border-transparent hover:border-border hover:bg-muted/60",
                            )}
                          >
                            <p className="text-sm font-medium text-foreground">{command.label}</p>
                            <p className="text-xs text-muted-foreground">{command.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
