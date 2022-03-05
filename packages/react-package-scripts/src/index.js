#!/usr/bin/env node

import chalk from 'react-dev-utils/chalk';
import { start } from './scripts/start';
import { build } from './scripts/build';
import { test } from './scripts/test';

const commands = {
  start: 'start',
  build: 'build',
  test: 'test',
};

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case commands.start:
    start();
    break;
  case commands.build:
    build();
    break;
  case commands.test:
    test();
    break;
  default:
    console.error(`Unkown command ${chalk.cyan(command)}. Valid commands are`);
    Object.entries(commands).forEach(([, validCommand]) =>
      console.log(`- ${chalk.cyan(validCommand)}`)
    );
    process.exit(1);
}
