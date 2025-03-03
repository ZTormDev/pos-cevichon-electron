import { execSync } from "child_process";
import fs from "fs";
import { readFileSync, writeFileSync } from "fs";

// Elimina la carpeta 'build' antes de la compilación
const buildDir = "build";
if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true, force: true });
  console.log(`Carpeta '${buildDir}' eliminada correctamente.`);
}

// Lee el argumento de la plataforma
const args = process.argv.slice(3);
const platformArg = args;

if (!platformArg) {
  throw new Error(
    "Debes especificar la plataforma con --platform=win|mac|linux"
  );
}
const platform = platformArg.toString();
console.log(platform);

// Define la carpeta de salida según la plataforma
let outputDir;
switch (platform) {
  case "win":
    outputDir = "build/windows";
    break;
  case "mac":
    outputDir = "build/mac";
    break;
  case "linux":
    outputDir = "build/linux";
    break;
  default:
    throw new Error(`Plataforma no soportada: ${platform}`);
}

// Ajusta la ruta de salida en electron-builder.json
const electronBuilderConfigPath = "./electron-builder.json";
const electronBuilderConfig = JSON.parse(
  readFileSync(electronBuilderConfigPath, "utf-8")
);

electronBuilderConfig.directories.output = outputDir;

// Escribe el archivo electron-builder.json con la nueva configuración
writeFileSync(
  electronBuilderConfigPath,
  JSON.stringify(electronBuilderConfig, null, 2)
);

// Ejecuta electron-builder para la plataforma específica
execSync(`npm run dist:${platform}`, { stdio: "inherit" });
