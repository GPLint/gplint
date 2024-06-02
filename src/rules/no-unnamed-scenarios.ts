import {GherkinData, RuleError} from '../types.js';
import { featureSpread } from './utils/gherkin.js';

export const name = 'no-unnamed-scenarios';

export function run({feature}: GherkinData): RuleError[] {
  if (!feature) {
    return [];
  }
  const errors = [] as RuleError[];
  featureSpread(feature).children.forEach(child => {
    if (child.scenario && !child.scenario.name) {
      errors.push({
        message: 'Missing Scenario name',
        rule   : name,
        line   : child.scenario.location.line,
        column : child.scenario.location.column,
      });
    }
  });
  return errors;
}
