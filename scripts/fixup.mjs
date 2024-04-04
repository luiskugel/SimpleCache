import fs from "fs";

const originalPackageJson = JSON.parse(
  fs.readFileSync("./package.json", "utf8")
);

fs.writeFileSync(
  "dist/cjs/package.json",
  JSON.stringify(
    {
      ...originalPackageJson,
      type: "commonjs",
    },
    null,
    2
  )
);
fs.writeFileSync(
  "dist/mjs/package.json",
  JSON.stringify(
    {
      ...originalPackageJson,
      type: "module",
    },
    null,
    2
  )
);
