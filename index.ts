const fs = require('fs');
const path = require('path');
const logger = require('pino')();
const glob = require('glob');
const readline = require('readline');
const handlebars = require('handlebars');

// Ignored files, directories and extensions
const IGNORE = ['/node_modules/', '/dist/', '.git'];
const FILE_HEADER_REGEX = '{-# START_FILE (.+?) #-}';

// Generate a handlebars file from a template project
export function generate(rootPath?: string, outputFile?: string) {
  if (!rootPath) rootPath = './';
  if (!outputFile) outputFile = 'output.hbs';
  if (outputFile[outputFile.length - 1] == '/') outputFile = outputFile.substring(0, outputFile.length - 2);
  let contents = '';

  glob(rootPath + '/**/*', {nodir: true}, (err, res: string[]) => {
    if (err) {
      logger.error(`Failed to read directory '${rootPath}': ${err}`);
      process.exit(1);
    } else {
      IGNORE.forEach((i) => {
        res = res.filter((x) => !x.includes(i));
      });

      res.forEach((filename) => {
        const filenameRelative = filename.replace(rootPath + '/', '');
        contents += `{-# START_FILE ${filenameRelative} #-}\n`;
        contents += fs.readFileSync(filename, 'utf8');
      });

      fs.writeFileSync(rootPath + outputFile, contents);
    }
  });
}

// Consume a handlebars file to generate a template project
export async function consume(inputPath: string, replacements: any) {
  const stream = fs.createReadStream(inputPath);
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let filename;
  let buffer = '';

  for await (let line of rl) {
    let res = (line as string).match(FILE_HEADER_REGEX);
    if (res !== null) {
      if (filename) {
        var template = handlebars.compile(buffer);
        let output: string = template(replacements);
        console.log(filename);
        fs.mkdirSync(path.dirname('./gen/' + filename), {recursive: true});
        fs.writeFileSync('./gen/' + filename, output);
      }
      filename = res[1];
      buffer = '';
      continue;
    } else {
      line += '\n';
      buffer += line;
    }
  }
}

generate('/home/wqsz7xn/Desktop/subql-starter', 'output.hbs');
consume('output.hbs', {name: 'wqsz7xn'});
