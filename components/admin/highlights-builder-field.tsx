"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type HighlightDraft = {
  title: string;
  description: string;
};

type HighlightRow = HighlightDraft & {
  id: string;
};

type HighlightsBuilderFieldProps = {
  name?: string;
  defaultValue: HighlightDraft[];
};

function rowId() {
  return `highlight-${Math.random().toString(36).slice(2, 10)}`;
}

export function HighlightsBuilderField({ name = "highlightsPayload", defaultValue }: HighlightsBuilderFieldProps) {
  const [rows, setRows] = useState<HighlightRow[]>(() =>
    (defaultValue.length > 0 ? defaultValue : [{ title: "", description: "" }]).map((item) => ({ ...item, id: rowId() })),
  );

  const serialized = useMemo(
    () =>
      JSON.stringify(
        rows
          .map((row) => ({
            title: row.title.trim(),
            description: row.description.trim(),
          }))
          .filter((row) => row.title || row.description),
      ),
    [rows],
  );

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label>Highlights</Label>
          <p className="mt-1 text-xs text-muted-foreground">Add short homepage highlights shown beneath the hero area.</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setRows((current) => [...current, { id: rowId(), title: "", description: "" }])}
        >
          Add highlight
        </Button>
      </div>

      <input type="hidden" name={name} value={serialized} />

      <div className="space-y-3">
        {rows.map((row, index) => {
          return (
            <Card key={row.id} className="gap-3 py-4">
              <CardContent className="space-y-3 px-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor={`${row.id}-title`}>Title</Label>
                    <Input
                      id={`${row.id}-title`}
                      value={row.title}
                      placeholder="Safety first architecture"
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setRows((current) =>
                          current.map((entry) => (entry.id === row.id ? { ...entry, title: nextValue } : entry)),
                        );
                      }}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`${row.id}-description`}>Description</Label>
                    <Textarea
                      id={`${row.id}-description`}
                      rows={2}
                      value={row.description}
                      placeholder="Standard driver-assist systems across the range."
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setRows((current) =>
                          current.map((entry) => (entry.id === row.id ? { ...entry, description: nextValue } : entry)),
                        );
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === 0}
                    onClick={() => {
                      setRows((current) => {
                        if (index === 0) {
                          return current;
                        }

                        const next = [...current];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        return next;
                      });
                    }}
                  >
                    Move up
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === rows.length - 1}
                    onClick={() => {
                      setRows((current) => {
                        if (index === current.length - 1) {
                          return current;
                        }

                        const next = [...current];
                        [next[index], next[index + 1]] = [next[index + 1], next[index]];
                        return next;
                      });
                    }}
                  >
                    Move down
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-rose-300 text-rose-700 hover:bg-rose-50"
                    onClick={() => {
                      setRows((current) => {
                        if (current.length === 1) {
                          return [{ id: rowId(), title: "", description: "" }];
                        }

                        return current.filter((entry) => entry.id !== row.id);
                      });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
