import {GherkinData, RuleError} from '../types.js';

export const name = 'no-unnamed-features';

export function run({feature}: GherkinData): RuleError[] {
	const errors = [] as RuleError[];

	if (!feature?.name) {
		const location = feature ? feature.location : {line: 0, column: 0};
		errors.push({
			message: 'Missing Feature name',
			rule   : name,
			line   : location.line,
			column : location.column,
		});
	}
	return errors;
}

export const documentation = {
	description: 'TODO',
	fixable: false,
	configurable: true,
	examples: [{
		title: 'Example',
		description: 'TODO',
		config: {
			'': 'error',
		}
	}],
};
