import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth";

function toBlobFileName(file: File) {
  const cleanedName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleanedName || `car-${Date.now()}.jpg`;
}

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN is missing" }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Upload must be an image" }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be 8MB or smaller" }, { status: 400 });
  }

  try {
    const blob = await put(`cars/${toBlobFileName(file)}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}
