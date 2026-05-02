fetch("http://localhost:3000/api/find-doppelganger", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ description: "una app para encontrar perros perdidos", lang: "es" })
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(err => console.error(err));
