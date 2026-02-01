import { promises as fs } from "fs";
import pkg from "./package.json" with { type: "json" };

async function postbuild() {
  const json = await fs.readFile("dist/manifest.json");
  const manifest = JSON.parse(json.toString());

  manifest.version = pkg.version;

  await fs.writeFile("dist/manifest.json", JSON.stringify(manifest, null, 2));

  // Firefox version below.

  manifest.background = {
    scripts: ["background.js"],
  };

  manifest.permissions.push("activeTab", "tabs");
  manifest.browser_specific_settings = {
    gecko: {
      id: "{8abca5e8-b1fb-4314-a0fb-b2fece5325c7}",
    },
  };

  try {
    await fs.rm("dist-firefox", { recursive: true });
  } catch (ex) {
  } finally {
    await fs.mkdir("dist-firefox");
  }

  await fs.cp("dist", "dist-firefox", { recursive: true });

  await fs.writeFile(
    "dist-firefox/manifest.json",
    JSON.stringify(manifest, null, 2),
  );
}

postbuild().then(() => console.log("Postbuild done"));
