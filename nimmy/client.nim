import std/[asyncjs, jsffi]

{.emit: """
export async function getUrl(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    console.log(text);
  } catch (e) {
    console.error('Error fetching content:', e);
  }
}
""".}

proc get*(url: string) {.importc: "getUrl", async.}
