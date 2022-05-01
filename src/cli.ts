import fs from 'fs';
import { program } from 'commander';
const pkg = require('../package');

import { cod } from './index';

program
  .addHelpText('beforeAll', `
           _-""-,-"'._         
     .-*'\`\`           \`\`-.__.-\`:
  .'o   ))\` \` \` \` \` \` \`_\`.---._:
   \`-'.._,,____...--*"\` \`"     
         \`\`
cod: An unassuming documentation generator.
  `)
  .enablePositionalOptions()
  .name('cod')
  .usage('[-b <doc-begin> -e <doc-end>] [-o <output-file>] [-u] <input-file>...')
  .showHelpAfterError('(add --help for additional information)')
  .option('-b <doc-begin>',   'String that marks the start of a doc-block', '/**')
  .option('-e <doc-end>',     'String that marks the end of a doc-block', '*/')
  .option('-o <output-file>', 'Output file', 'STDOUT')
  .option('-u --ugly',        'Output non-pretty JSON.', false)
  .version(pkg.version, '-v --version', 'output the current version');

program.parse();

const options = program.opts();
const args = program.args;

if (args.length === 0) {
  program.outputHelp();
}
else {
  const input = fs.readFileSync(args[0], 'utf-8');
  const transformed = cod(input, {
    docBegin: options.b,
    docEnd: options.e,
  });
  const formatted = options.u ? JSON.stringify(transformed) : JSON.stringify(transformed, null, 2);
  if (options.o === 'STDOUT') {
    process.stdout.write(formatted);
  }
  else {
    fs.writeFileSync(options.o, formatted);
  }
}