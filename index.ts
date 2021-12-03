const fs = require('fs');
const logger = require('pino')();
const glob = require('glob');
const handlebars = require('handlebars');

// Ignored files, directories and extensions
const IGNORE = ['/node_modules/', '/dist/', '.git'];

function exitWithLog(code: number, reason: string) {
  logger.error(reason);
  process.exit(code);
}

// Generate a handlebars file from a template project
export function generate(projectRootPath?: string, outputFile?: string) {
  if (!projectRootPath) projectRootPath = './';
  if (!outputFile) outputFile = 'output.hbs';
  let contents = '';

  glob(projectRootPath + '/**/*', {nodir: true}, (err, res: string[]) => {
    if (err) {
      exitWithLog(1, `Failed to read directory '${projectRootPath}': ${err}`);
    } else {
      IGNORE.forEach((i) => {
        res = res.filter((x) => !x.includes(i));
      });

      res.forEach((filename) => {
        contents += `\n${filename}\n`;
        contents += fs.readFileSync(filename, 'utf8');
      });

      fs.writeSync(outputFile, contents);
    }
  });
}

// Consume a handlebars file to generate a template project
export function consume() {
  const template = handlebars.compile('Name: {{name}}');
  console.log(template({name: 'Nils'}));
}

generate('/home/wqsz7xn/Desktop/subql-starter', 'output.hbs');
