import { NextRequest, NextResponse } from "next/server";

function ehHostApp(hostname: string): boolean {
  const configurado = process.env.APP_HOST?.toLowerCase();
  if (configurado && hostname === configurado) return true;
  return (
    hostname === "app.kyrontecnologia.com" ||
    hostname === "app.kyroncompany.com" ||
    hostname === "app.localhost"
  );
}

export function middleware(request: NextRequest) {
  const hostname = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (!ehHostApp(hostname)) return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/app")
  ) {
    return NextResponse.next();
  }

  const destino = request.nextUrl.clone();
  destino.pathname = `/app${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(destino);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
