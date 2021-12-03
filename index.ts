const fs = require('fs');
const logger = require('pino')();
const glob = require('glob');
const readline = require('readline');
const handlebars = require('handlebars');

// Ignored files, directories and extensions
const IGNORE = ['/node_modules/', '/dist/', '.git'];
const FILE_HEADER_REGEX = '{-# START_FILE (.+?) #-}';

function exitWithLog(code: number, reason: string) {
  logger.error(reason);
  process.exit(code);
}

// Generate a handlebars file from a template project
export function generate(projectRootPath?: string, outputFile?: string) {
  if (!projectRootPath) projectRootPath = './';
  if (!outputFile) outputFile = 'output.hbs';
  if (outputFile[outputFile.length - 1] == '/') outputFile = outputFile.substring(0, outputFile.length - 2);
  let contents = '';

  glob(projectRootPath + '/**/*', {nodir: true}, (err, res: string[]) => {
    if (err) {
      exitWithLog(1, `Failed to read directory '${projectRootPath}': ${err}`);
    } else {
      IGNORE.forEach((i) => {
        res = res.filter((x) => !x.includes(i));
      });

      res.forEach((filename) => {
        const fnRel = filename.replace(projectRootPath + '/', '');
        contents += `{-# START_FILE ${fnRel} #-}\n`;
        contents += fs.readFileSync(filename, 'utf8');
      });

      fs.writeFileSync(outputFile, contents);
    }
  });
}

// Consume a handlebars file to generate a template project
export async function consume(inputFile: string, opts?: any) {
  const stream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let filename;
  let buffer = '';

  for await (const line of rl) {
    let res = (line as string).match(FILE_HEADER_REGEX);
    if (res !== null) {
      if (filename) {
        var template = handlebars.compile(buffer);
        let output: string = template({name: 'wqsz7xn'});
        // fs.writeFileSync('./gen/' + filename, output);
      }
      filename = res[1];
      buffer = '';
      continue;
    } else {
      buffer += line;
    }
  }
}

generate('/home/wqsz7xn/Desktop/subql-starter', 'output.hbs');
consume('output.hbs');
