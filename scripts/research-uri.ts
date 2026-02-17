
const uri = "https://uri.etsi.org/ngsi-ld/";
console.log(`Fetching ${uri}...`);

try {
  const resp = await fetch(uri, {
    headers: {
      "Accept": "application/ld+json, application/rdf+xml, text/turtle, text/html"
    }
  });
  console.log(`Status: ${resp.status}`);
  console.log(`Content-Type: ${resp.headers.get("content-type")}`);
  const text = await resp.text();
  console.log("Response snippet:");
  console.log(text.slice(0, 1000));
} catch (e) {
  console.error("Fetch failed:", e);
}
