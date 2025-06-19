import { type NextRequest, NextResponse } from "next/server";

import { api } from "~/trpc/server";

export const GET = async () => {
  return NextResponse.json(await api.user.getVerificationKeys());
};
