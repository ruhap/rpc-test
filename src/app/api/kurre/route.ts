import { appRouter } from "@/kurre/server/routes";
import { handleRpc } from "@/library/core/server";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest) => {
  const data = await handleRpc(req, appRouter);
  return NextResponse.json(data);
};

export { handler as GET, handler as POST };
