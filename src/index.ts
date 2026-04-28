import chalk from "chalk";
import { program } from "commander";
import { handlePrint } from './print.js';

const OPCOES = ['web', 'print'] as const;
function isOpcao(val: string): val is typeof OPCOES[number] {
  return (OPCOES as readonly string[]).includes(val);
}

program
  .name("livro")
  .description("Conversor do livro")
  .version("v0.x")
  .argument(
    "<tipo>", 
    `Escolhe o tipo de saída do livro.\nOpções: [${OPCOES.join(', ')}]`
  )
  .option(
    "-m, --manifest <caminho>", 
    "Escolhe o arquivo de manifesto do livro",
    "./manifest.json"
  )
  .action((tipo: string) => {
    if (!isOpcao(tipo)) {
      console.error(
        chalk.bold(
          chalk.red("ERRO:"), 
          chalk.grey("Tipo de saída inválido.\n"),
          chalk.grey.italic(`Tipos válidos: ${OPCOES.join(", ")}`)
          )
        );
        return;
    }

    if (tipo == 'print') {
      console.log(chalk.bgWhite.black.bold("[PRINT]") + ": " + chalk.greenBright("Gerando documento..."));
      handlePrint();
    } else {
      console.log(chalk.bgWhite.black.bold("[WEB]") + ": " + chalk.greenBright("Gerando documento..."));
    }
  });

program.parse();