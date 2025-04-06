import { trace } from "npm:@opentelemetry/api@1";

const INDEX_ROUTE = new URLPattern({ pathname: "/" });
const BOOK_ROUTE = new URLPattern({ pathname: "/book/:id" });

Deno.serve(async (req) => {
  const span = trace.getActiveSpan();
  if (INDEX_ROUTE.test(req.url)) {
    span.setAttribute("http.route", "/");
    span.updateName(`${req.method} /`);

    // handle index route
  } else if (BOOK_ROUTE.test(req.url)) {
    span.setAttribute("http.route", "/book/:id");
    span.updateName(`${req.method} /book/:id`);

    // handle book route
  } else {
    return new Response("Not found", { status: 404 });
  }
  return Response.json("OK")
});
