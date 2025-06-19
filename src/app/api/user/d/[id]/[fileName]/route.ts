import { type NextRequest, NextResponse } from "next/server";

import { backend } from "~/server/api/trpc";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fileName: string }> },
) => {
  const { id, fileName } = await params;
  const response = await backend.downloadRaw(id, fileName, "GET", false);
  return response.clone();
};

export const HEAD = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fileName: string }> },
) => {
  const { id, fileName } = await params;
  const { headers } = await backend.downloadRaw(id, fileName, "HEAD", false);
  return new NextResponse(null, { headers });
};
