import _ from 'lodash';
import {GherkinData, RuleSubConfig, RuleError} from '../types.js';
import {TableCell, TableRow} from '@cucumber/messages';

const TABLE_SEPARATOR = '|';
const TABLE_SPLITTER = /(?<!\\)\|/;

export const name = 'table-align';
export const availableConfigs = {
  examples: true,
  steps: true,
};

export function run({feature, file}: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): RuleError[] {
  function _checkRows(rows: readonly TableRow[]) {
    if (rows.length === 0 || rows.some(row => row == null)) {
      return;
    }

    rows.forEach(row =>
      row.cells.forEach(cell => {
        cell.value = cell.value.replace(/\|/g, '\\|');
      })
    );

    const columnsCount = rows[0].cells.length;
    const columns = _.range(columnsCount).map(i => rows.map(row => row.cells[i]));

    const columnsMaxLength = columns.map(column => Math.max(...column.map(cell => cell.value.length)));

    rows.forEach(row => {
      const realLine = _.trim(file.lines[row.location.line - 1].trim(), TABLE_SEPARATOR);
      const realCells = realLine.split(TABLE_SPLITTER);

      row.cells.forEach((cell, index) => {
        const rowLine = ` ${cell.value.padEnd(columnsMaxLength[index])} `;

        if (rowLine !== realCells[index]) {
          errors.push(createError(cell));
        }
      });
    });
  }


  if (!feature) {
    return [];
  }
  const mergedConfig = _.merge({}, availableConfigs, configuration);

  const errors = [] as RuleError[];

  for (const {scenario, background} of feature.children) {
    if (mergedConfig.steps) {
      const tableSteps = (scenario || background).steps.filter(step => step.dataTable != null);

      for (const step of tableSteps) {
        _checkRows(step.dataTable.rows);
      }
    }

    if (mergedConfig.examples && scenario?.examples != null) {
      for (const example of scenario.examples) {
        _checkRows([example.tableHeader, ...example.tableBody]);
      }
    }
  }

  return errors;
}

function createError(cell: TableCell): RuleError {
  return {
    message: `Cell with value "${cell.value}" is not aligned`,
    rule: name,
    line: cell.location.line,
    column: cell.location.column,
  };
}
