#!/usr/bin/env node

import chalk from 'chalk';
import { watch } from './scripts/watch';
import { build } from './scripts/build';
import { test } from './scripts/test';

const commands = {
  watch: 'watch',
  build: 'build',
  test: 'test',
};

const args = process.argv.slice(2);
const command = args.find((arg) => Object.keys(commands).includes(arg));

let cleanArgs = [];
if (command) {
  cleanArgs = args.filter((arg) => arg !== command);
}

switch (command) {
  case commands.watch:
    watch();
    break;
  case commands.build:
    build();
    break;
  case commands.test:
    test(cleanArgs);
    break;
  default:
    console.error(
      `Unkown command. Valid commands are`,
      Object.entries(commands).reduce((acc, [, validCommand]) => {
        acc += `\n- ${chalk.cyan(validCommand)}`;
        return acc;
      }, '')
    );
    process.exit(1);
}
