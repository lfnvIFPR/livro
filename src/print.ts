import { ManifestSchema, type Manifest } from "./manifest.js";
import { readFileSync, mkdirSync, existsSync, copyFileSync, writeFileSync } from "node:fs";
import { resolve, dirname, join, basename } from "node:path";
import { execSync } from "node:child_process";
import z from "zod";
import chalk from "chalk";

function log(...args: string[]) {
  console.log(chalk.bgWhite.black.bold("[PRINT]") + ": ", ...args);
}

function p_error(...args: string[]) {
  console.error(chalk.bgRedBright.black.bold("[PRINT]") + ": ", ...args);
}

export function handlePrint(manifest: string) {

  let tempPath: string | null = null;
  try {
    log("Lendo arquivo de manifesto...");
    
    // 1. Resolve o caminho absoluto e carrega o JSON
    const absoluteManifestPath = resolve(manifest);
    const manifestDir = dirname(absoluteManifestPath);
    const rawData = readFileSync(absoluteManifestPath, "utf-8");
    const jsonData = JSON.parse(rawData);

    // 2. Valida a estrutura usando Zod de forma segura (safeParse)
    const parsedManifest = ManifestSchema.safeParse(jsonData);

    // Se falhar, tratamos o erro aqui mesmo, com tipagem 100% segura
    if (!parsedManifest.success) {
      p_error("Problemas encontrados no manifesto JSON:");
      (parsedManifest.error as any).errors.forEach((e: { path: any[]; message: any; }) => {
        p_error(` - ${e.path.join('.')}: ${e.message}`);
      });
      process.exit(1);
    }

    const manifestObj = parsedManifest.data;

    const distDir = join(manifestDir, "dist");
    if (!existsSync(distDir)) {
      mkdirSync(distDir, { recursive: true });
    }

    if (manifestObj.figuras && manifestObj.figuras.length > 0) {
      log("Copiando figuras para a pasta dist...");
      
      for (const figRelativePath of manifestObj.figuras) {
        const srcPath = resolve(manifestDir, figRelativePath);
        const fileName = basename(figRelativePath);
        const destPath = join(distDir, fileName);

        if (existsSync(srcPath)) {
          copyFileSync(srcPath, destPath);
          log(`\t-> ${chalk.italic("Copiado: ")} ${chalk.bold.greenBright(figRelativePath)} -> ${chalk.yellowBright("dist/"+fileName)}`);
        } else {
          p_error(`Aviso: Arquivo de imagem não encontrado em: ${srcPath}`);
        }
      }
    }

    const rawChapters = manifestObj.capitulos.flat();
    const inputFiles = rawChapters.map(cap => `"${join(manifestDir, cap)}"`);

    const outputFile = join(distDir, "index.html");
    const cssPath = "styles/print.css";
    copyFileSync(cssPath, "dist/print.css");

    tempPath = join(distDir, ".temp-pagedjs.html");
    const pagedJsScript = `<script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>\n`;
    writeFileSync(tempPath, pagedJsScript, "utf-8");

    const pandocArgs = [
      "-s",
      "-d defaults.yaml",
      "--file-scope",
      `--css="print.css"`,
      `--include-in-header="${tempPath}"`,
      `-M title="${manifestObj.titulo}"`,
    ];

    const autores = Array.isArray(manifestObj.autor) ? manifestObj.autor : [manifestObj.autor];
    autores.forEach(autor => {
      pandocArgs.push(`-M author="${autor}"`);
    });

    const command = `pandoc ${pandocArgs.join(" ")} -o "${outputFile}" ${inputFiles.join(" ")}`;

    log("Executando Pandoc com o seguinte comando:");
    log(chalk.bold.yellowBright(`> ${command}\n`));

    execSync(command, { stdio: "inherit" });

    log(chalk.greenBright.bold(`Sucesso! HTML renderizado em: ${chalk.italic.greenBright(outputFile)}`));
    log(chalk.grey.italic("Aperte ") + chalk.bgWhite.black(" CTRL+P ") + chalk.gray.italic(" para salvar o PDF da página no navegador."));

  } catch (error) {
    p_error("Erro fatal na execução:");
    
    if (error instanceof Error) {
      p_error(error.message);
    } else {
      p_error(String(error));
    }
    
    process.exit(1);
  }
}