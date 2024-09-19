import { handleRpc } from "@/library/core/server";
import { appRouter } from "@/routes";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest) => {
    const rpcResponse = await handleRpc(req, appRouter);

    if (rpcResponse.type === "success") {
      return NextResponse.json(rpcResponse.result, { status: 200 });
    } else {
      return NextResponse.json(
        { error: rpcResponse.error.message },
        { status: rpcResponse.error.code }
      );
    }
};

export { handler as GET, handler as POST };

