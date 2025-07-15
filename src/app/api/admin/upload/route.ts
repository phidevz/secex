import { type NextRequest, NextResponse } from "next/server";

import { backend } from "~/server/api/trpc";
import { auth } from "~/server/auth";

export const POST = async (req: NextRequest) => {
  const session = await auth();
  if (session === null) {
    return new NextResponse(null, { status: 403 });
  }
  console.log(req.headers);

  const formData = await req.formData();
  const file = formData.get("file");
  const originalSize = formData.get("originalSize");
  const originalType = formData.get("originalType");

  console.log("XX", file, originalSize, originalType);

  return NextResponse.json(session);
};
