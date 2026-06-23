import chalk from "chalk";
import { program } from "commander";
import { handlePrint } from './print.js';

const OPCOES = ['web', 'print'] as const;
function isOpcao(val: string): val is typeof OPCOES[number] {
  return (OPCOES as readonly string[]).includes(val);
}

function ErroFinal(...mensagem: string[]) {
  console.error(
    chalk.bold(
      chalk.red("ERRO:"), 
      ...mensagem
      )
    );
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
  .action((tipo: string, options) => {
    if (!isOpcao(tipo)) {
      ErroFinal(
        chalk.grey("Opção inválida"),
        chalk.grey.italic(`Tipos válidos: ${OPCOES.join(", ")}`)
      )
      return;
    }

    if (tipo == 'print') {
      if (!options.manifest) {
        ErroFinal("Opção manifest não existe", "não é possível chegar aqui");
        return;
      }
      console.log(chalk.bgWhite.black.bold("[PRINT]") + ": " + chalk.greenBright("Gerando documento..."));
      handlePrint(options.manifest);
    } else {
      console.log(chalk.bgWhite.black.bold("[WEB]") + ": " + chalk.greenBright("Gerando documento..."));
    }
  });

program.parse();