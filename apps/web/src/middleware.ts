export { default } from "next-auth/middleware";

export const config = { 
  matcher: ["/dashboard/:path*", "/brain/:path*", "/automation/:path*", "/databases/:path*", "/editor/:path*"] 
};
