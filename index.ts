import fs from 'fs';
import https from 'https';
import path from 'path';
import glob from 'glob';
import handlebars from 'handlebars';
import {templates} from './templates';

// Ignored files, directories and extensions
const IGNORE = ['/node_modules/', '/dist/', '.git'];
const FILE_HEADER_REGEX = '{-# START_FILE (.+?) #-}';
const HTTPS_REMOTE = 'https://raw.githubusercontent.com/wqsz7xn/subql-templates/main/';

/**
 * @description Consume a template project to generate a handlebars file
 * @param {string} projectRootPath Path to the project root to operate on
 * @param {string} outputFile Name of the output file (including extension)
 */
export function consume(projectRootPath?: string, outputFile?: string) {
  if (!projectRootPath) {
    projectRootPath = './';
  }
  if (projectRootPath[projectRootPath.length - 1] === '/') {
    projectRootPath = projectRootPath[projectRootPath.length - 2];
  }
  if (!outputFile) {
    outputFile = `${projectRootPath.split(path.sep).slice(-1).pop()}.hbs`;
  }

  let contents = '';

  glob(`${projectRootPath}/**/*`, {nodir: true}, (err, res: string[]) => {
    if (err) {
      throw err;
    } else {
      IGNORE.forEach((i) => {
        res = res.filter((x) => !x.includes(i));
      });

      res.forEach((filename) => {
        const filenameRelative = filename.replace(`${projectRootPath}/`, '');
        contents += `{-# START_FILE ${filenameRelative} #-}\n`;
        contents += fs.readFileSync(filename, 'utf8');
      });

      fs.writeFileSync(`${projectRootPath}/${outputFile}`, contents);
    }
  });
}

/**
 * @description Generate a template project from a handlebars file fetched over https
 * @param {string} outputPath Output subpath for generated files
 * @param {string} templateName Name of the template
 * @param {any} replacements Replacements to be made via handlebars
 */
export function generate(outputPath: string, templateName: string, replacements: any) {
  if (Object.keys(templates).includes(templateName)) {
    let templateFile = templateName + '.hbs';
    let body = '';

    https.get(HTTPS_REMOTE + templateFile, (response) => {
      response.on('data', (chunk) => {
        body += chunk;
      });

      response.on('end', () => {
        let filename;
        let fileBuffer = '';

        for (const line of body.split('\n')) {
          let result = (line as string).match(FILE_HEADER_REGEX);
          if (result !== null) {
            if (filename) {
              let template = handlebars.compile(fileBuffer);
              let outputBuffer: string = template(replacements);
              fs.mkdirSync(path.dirname(`${outputPath}/${templateName}/${filename}`), {recursive: true});
              fs.writeFileSync(`${outputPath}/${templateName}/${filename}`, outputBuffer);
            }
            filename = result[1];
            fileBuffer = '';
            continue;
          } else {
            fileBuffer += line + '\n';
          }
        }
      });
    });
  } else {
    throw Error(`Could not find template '${templateName}' in template repository`);
  }
}
