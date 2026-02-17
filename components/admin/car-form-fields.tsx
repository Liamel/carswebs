"use client";

import { useMemo, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type CarSpecDraft = {
  label: string;
  value: string;
};

type CarSpecRow = CarSpecDraft & {
  id: string;
};

type CarFormFieldsProps = {
  idPrefix: string;
  bodyTypeOptions: string[];
  initialName?: string;
  initialSlug?: string;
  initialPriceFrom?: number;
  initialBodyType?: string;
  initialFeatured?: boolean;
  initialDescription?: string;
  initialImages?: string[];
  initialSpecs?: CarSpecDraft[];
};

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CarFormFields({
  idPrefix,
  bodyTypeOptions,
  initialName = "",
  initialSlug = "",
  initialPriceFrom,
  initialBodyType,
  initialFeatured = false,
  initialDescription = "",
  initialImages = [],
  initialSpecs = [],
}: CarFormFieldsProps) {
  const normalizedBodyTypeOptions = useMemo(() => {
    if (initialBodyType && !bodyTypeOptions.includes(initialBodyType)) {
      return [initialBodyType, ...bodyTypeOptions];
    }

    return bodyTypeOptions;
  }, [bodyTypeOptions, initialBodyType]);

  const [name, setName] = useState(initialName);
  const [bodyType, setBodyType] = useState(initialBodyType ?? normalizedBodyTypeOptions[0] ?? "SUV");
  const [featured, setFeatured] = useState(initialFeatured);
  const [images, setImages] = useState(initialImages);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [specRows, setSpecRows] = useState<CarSpecRow[]>(() =>
    (initialSpecs.length > 0 ? initialSpecs : [{ label: "", value: "" }]).map((row) => ({
      id: makeId(idPrefix),
      label: row.label,
      value: row.value,
    })),
  );

  const specsPayload = useMemo(
    () =>
      JSON.stringify(
        specRows
          .map((row) => ({ label: row.label.trim(), value: row.value.trim() }))
          .filter((row) => row.label || row.value),
      ),
    [specRows],
  );

  const imagesPayload = useMemo(() => JSON.stringify(images.filter(Boolean)), [images]);
  const generatedSlug = useMemo(() => {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return initialSlug || "";
    }

    return slugify(trimmedName);
  }, [initialSlug, name]);

  async function uploadSelectedFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    setIsUploadingImages(true);

    try {
      const uploadedUrls = await Promise.all(
        Array.from(fileList).map(async (file) => {
          const payload = new FormData();
          payload.append("file", file);

          const response = await fetch("/api/admin/uploads/car-image", {
            method: "POST",
            body: payload,
          });

          if (!response.ok) {
            const message = (await response.json().catch(() => ({ error: "Upload failed" }))) as { error?: string };
            throw new Error(message.error ?? "Upload failed");
          }

          const data = (await response.json()) as { url: string };
          return data.url;
        }),
      );

      setImages((current) => [...current, ...uploadedUrls]);
      toast.success(uploadedUrls.length === 1 ? "Image uploaded" : `${uploadedUrls.length} images uploaded`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image";
      toast.error(message);
    } finally {
      setIsUploadingImages(false);
    }
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="grid gap-1.5 md:col-span-2">
          <Label htmlFor={`${idPrefix}-name`}>Model name</Label>
          <Input
            id={`${idPrefix}-name`}
            name="name"
            value={name}
            placeholder="Astra Voyager 7"
            onChange={(event) => {
              const nextName = event.target.value;
              setName(nextName);
            }}
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-price-from`}>From price (USD)</Label>
          <Input
            id={`${idPrefix}-price-from`}
            name="priceFrom"
            type="number"
            min={1}
            defaultValue={initialPriceFrom}
            placeholder="28900"
            required
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-slug-preview`}>Slug (auto-generated)</Label>
          <Input
            id={`${idPrefix}-slug-preview`}
            value={generatedSlug}
            placeholder="astra-voyager-7"
            readOnly
          />
          <p className="text-xs text-muted-foreground">Automatically created from model name using lowercase and hyphens.</p>
        </div>

        <div className="grid gap-1.5">
          <Label>Body type</Label>
          <input type="hidden" name="bodyType" value={bodyType} />
          <Select value={bodyType} onValueChange={setBodyType}>
            <SelectTrigger>
              <SelectValue placeholder="Select body type" />
            </SelectTrigger>
            <SelectContent>
              {normalizedBodyTypeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-description`}
          name="description"
          rows={3}
          defaultValue={initialDescription}
          placeholder="Family-focused seven-seater with flexible cargo layout..."
          required
        />
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Featured model</p>
            <p className="text-xs text-muted-foreground">Featured cars appear on the homepage model cards.</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="hidden" name="featured" value={featured ? "true" : "false"} />
            <Switch checked={featured} onCheckedChange={setFeatured} aria-label="Featured model" />
          </div>
        </div>
      </div>

      <input type="hidden" name="imagesPayload" value={imagesPayload} />
      <div className="grid gap-3 rounded-2xl border border-border/70 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <Label htmlFor={`${idPrefix}-image-upload`}>Image gallery</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload model photos, then set the first image as primary for cards and lists.
            </p>
          </div>
          <label
            htmlFor={`${idPrefix}-image-upload`}
            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-full border border-border px-3 text-sm font-medium"
          >
            {isUploadingImages ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
              </span>
            ) : (
              "Upload images"
            )}
          </label>
          <input
            id={`${idPrefix}-image-upload`}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={isUploadingImages}
            onChange={async (event) => {
              await uploadSelectedFiles(event.currentTarget.files);
              event.currentTarget.value = "";
            }}
          />
        </div>

        {images.length === 0 ? <p className="text-xs text-rose-700">Add at least one image before saving.</p> : null}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((imageUrl, index) => (
            <Card key={`${imageUrl}-${index}`} className="gap-3 py-3">
              <CardContent className="space-y-3 px-3">
                <div className="h-28 rounded-xl border border-border/70 bg-muted" style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }} />
                <div className="flex items-center justify-between gap-2">
                  {index === 0 ? (
                    <Badge variant="success" className="gap-1">
                      <Star className="h-3 w-3" /> Primary
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Image {index + 1}</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === 0}
                    onClick={() => {
                      setImages((current) => {
                        const next = [...current];
                        const [selected] = next.splice(index, 1);
                        next.unshift(selected);
                        return next;
                      });
                    }}
                  >
                    Set primary
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === 0}
                    onClick={() => {
                      setImages((current) => {
                        if (index === 0) {
                          return current;
                        }

                        const next = [...current];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        return next;
                      });
                    }}
                  >
                    Left
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === images.length - 1}
                    onClick={() => {
                      setImages((current) => {
                        if (index === current.length - 1) {
                          return current;
                        }

                        const next = [...current];
                        [next[index], next[index + 1]] = [next[index + 1], next[index]];
                        return next;
                      });
                    }}
                  >
                    Right
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-rose-300 text-rose-700 hover:bg-rose-50"
                    onClick={() => {
                      setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <input type="hidden" name="specsPayload" value={specsPayload} />
      <div className="grid gap-3 rounded-2xl border border-border/70 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label>Specifications</Label>
            <p className="mt-1 text-xs text-muted-foreground">Add key-value rows like Engine / 2.0T, Range / 520 km.</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setSpecRows((current) => [...current, { id: makeId(idPrefix), label: "", value: "" }]);
            }}
          >
            Add spec
          </Button>
        </div>

        <div className="space-y-2">
          {specRows.map((row, index) => (
            <Card key={row.id} className="gap-3 py-3">
              <CardContent className="grid gap-2 px-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <div className="grid gap-1.5">
                  <Label htmlFor={`${row.id}-label`}>Label</Label>
                  <Input
                    id={`${row.id}-label`}
                    value={row.label}
                    placeholder="Engine"
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setSpecRows((current) =>
                        current.map((entry) => (entry.id === row.id ? { ...entry, label: nextValue } : entry)),
                      );
                    }}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor={`${row.id}-value`}>Value</Label>
                  <Input
                    id={`${row.id}-value`}
                    value={row.value}
                    placeholder="2.0T AWD"
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setSpecRows((current) =>
                        current.map((entry) => (entry.id === row.id ? { ...entry, value: nextValue } : entry)),
                      );
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 md:justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === 0}
                    onClick={() => {
                      setSpecRows((current) => {
                        if (index === 0) {
                          return current;
                        }

                        const next = [...current];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        return next;
                      });
                    }}
                  >
                    Up
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === specRows.length - 1}
                    onClick={() => {
                      setSpecRows((current) => {
                        if (index === current.length - 1) {
                          return current;
                        }

                        const next = [...current];
                        [next[index], next[index + 1]] = [next[index + 1], next[index]];
                        return next;
                      });
                    }}
                  >
                    Down
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-rose-300 text-rose-700 hover:bg-rose-50"
                    onClick={() => {
                      setSpecRows((current) => {
                        if (current.length === 1) {
                          return [{ id: makeId(idPrefix), label: "", value: "" }];
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
          ))}
        </div>
      </div>
    </>
  );
}
