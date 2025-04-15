import { d as private_env } from "./shared-server.js";
const BASIC_AUTH_USER = private_env.BASIC_AUTH_USER;
const BASIC_AUTH_PASS = private_env.BASIC_AUTH_PASS;
const handle = async ({ event, resolve }) => {
  if (!BASIC_AUTH_USER || !BASIC_AUTH_PASS) {
    return new Response("Basic auth credentials not configured", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"'
      }
    });
  }
  const authHeader = event.request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"'
      }
    });
  }
  const base64Credentials = authHeader.slice("Basic ".length).trim();
  let credentials;
  try {
    credentials = atob(base64Credentials);
  } catch {
    return new Response("Invalid authorization header", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"'
      }
    });
  }
  const [username, password] = credentials.split(":");
  if (username !== BASIC_AUTH_USER || password !== BASIC_AUTH_PASS) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"'
      }
    });
  }
  return resolve(event);
};
export {
  handle
};
