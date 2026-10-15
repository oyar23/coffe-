// Run against the production server after npm run build && npm start -- --port 3013.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const base = process.env.MARCA_TEST_URL ?? "http://127.0.0.1:3013";
const manifest = JSON.parse(
  await readFile(".next/server/server-reference-manifest.json", "utf8"),
);
const action = Object.entries(manifest.node).find(
  ([, value]) => value.exportedName === "saveBrand",
)?.[0];
assert.ok(action, "saveBrand action missing");
async function save(theme, background) {
  const response = await fetch(`${base}/admin/marca`, {
    method: "POST",
    headers: {
      "Next-Action": action,
      "Content-Type": "text/plain;charset=UTF-8",
      Origin: base,
    },
    body: JSON.stringify([theme, background]),
  });
  assert.equal(response.status, 200);
  return response.text();
}
const variants = [
  [
    {
      primary: "#6f4e37",
      secondary: "#f5eee6",
      text: "#30251f",
      font: "Lora, serif",
      logo: "/placeholder.svg",
    },
    { type: "image", src: "/backgrounds/default.svg", overlay: 0.25 },
  ],
  [
    {
      primary: "#a34722",
      secondary: "#fff0dc",
      text: "#3c281e",
      font: "Playfair Display, serif",
      logo: "/placeholder.svg",
    },
    { type: "component", src: "gradiente-cafe", overlay: 0.2 },
  ],
  [
    {
      primary: "#6d327d",
      secondary: "#fff1fc",
      text: "#302039",
      font: "Nunito, sans-serif",
      logo: "/placeholder.svg",
    },
    { type: "component", src: "gradiente-cafe", overlay: 0.15 },
  ],
];
for (const [theme, background] of variants) {
  assert.match(await save(theme, background), /Marca guardada/);
  const menu = await (await fetch(base)).text();
  for (const color of [theme.primary, theme.secondary, theme.text])
    assert.ok(menu.includes(color), `theme ${color} absent`);
  assert.ok(menu.includes(background.src), "background absent");
}
for (const [type, src] of [
  ["video", "/admin/marca/examples/sample.mp4"],
  ["lottie", "/admin/marca/examples/sample.json"],
]) {
  assert.match(
    await save(variants[0][0], { type, src, overlay: 0.2 }),
    /Marca guardada/,
  );
  const menu = await (await fetch(base)).text();
  assert.ok(menu.includes(src));
  const asset = await fetch(`${base}${src}`);
  assert.equal(asset.status, 200);
}
assert.match(
  await save(variants[0][0], {
    type: "component",
    src: "not-registered",
    overlay: 0.2,
  }),
  /Eleg/,
);
await save(...variants[0]);
assert.equal((await fetch(`${base}/admin/marca`)).status, 200);
console.log(
  "Production HTTP checks passed: three campaign themes, four background contracts, assets, server action validation and menu revalidation. Visual and CPU checks require a connected browser.",
);
