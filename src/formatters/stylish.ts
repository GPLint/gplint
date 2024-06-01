import os from 'os';
import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import table from 'text-table';
import {ErrorsByFile, RuleErrorLevel} from '../types.js';

const LEVELS_CONFIG = {
  1: {name: 'warning', color: chalk.yellow},
  2: {name: 'error', color: chalk.red},
};

function stylizeError(error: RuleErrorLevel, maxLineLength: number): string[] {
  const errorLocation = getLocationString(error);
  const errorLocationPadded = errorLocation.padEnd(maxLineLength);
  const errorLocationStylized = chalk.gray(errorLocationPadded);
  const level = LEVELS_CONFIG[error.level as 1 | 2];

  const errorRuleStylized = chalk.gray(error.rule);

  return ['', errorLocationStylized, level.color(level.name), error.message, errorRuleStylized];
}

function getLocationString(loc: RuleErrorLevel): string {
  return `${loc.line}:${loc.column ? loc.column : '0'}`;
}

function getMaxLocationLength(result: ErrorsByFile): number {
  let length = 0;
  result.errors.forEach(error => {
    const errorStr = getLocationString(error);
    if (errorStr.length > length) {
      length = errorStr.length;
    }
  });
  return length;
}

/**
 * Given a word and a count, append an s if count is not one.
 * (Based on eslint version)
 * @param {string} word A word in its singular form.
 * @param {int} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word: string, count: number): string {
  return (count === 1 ? word : `${word}s`);
}

export function print(results: ErrorsByFile[]): string {
  let output = '\n',
    warnCount = 0,
    errorCount = 0;

  results.forEach(result => {
    result.errors.forEach(e => {
      if (e.level === 1) {
        warnCount++;
      } else if (e.level === 2) {
        errorCount++;
      }
    });
    if (result.errors.length > 0) {
      const maxLineLength = getMaxLocationLength(result);
      output += chalk.underline(result.filePath);
      output += os.EOL;

      output += table(
        result.errors.map(error => stylizeError(error, maxLineLength)),
        {
          align: ['.', 'r', 'l'],
          stringLength: (str: string): number => stripAnsi(str).length,
        }
      );
      output += os.EOL + os.EOL;
    }
  });

  const problemsCount = warnCount + errorCount;

  if (problemsCount > 0) {
    const color = errorCount > 0 ? chalk.red : chalk.yellow;

    output += color.bold([
      '\u2716 ',
      problemsCount, pluralize(' problem', problemsCount),
      ' (',
      errorCount, pluralize(' error', errorCount),
      ', ',
      warnCount, pluralize(' warning', warnCount),
      ')',
      '\n'
    ].join(''));
  }

  return problemsCount > 0 ? output : '';
}
