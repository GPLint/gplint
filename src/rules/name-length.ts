import _ from 'lodash';
import {GherkinData, RuleError, RuleSubConfig} from '../types.js';
import {Background, Location, Scenario} from '@cucumber/messages';
import { featureSpread } from './utils/gherkin.js';

export const name = 'name-length';

export const availableConfigs = {
	'Feature': 70,
	'Rule': 70,
	'Step': 70,
	'Scenario': 70
};

type Configuration = RuleSubConfig<typeof availableConfigs>;

function test(stepText: string, location: Location, configuration: Configuration, type: keyof Configuration, errors: RuleError[]) {
	if (stepText && (stepText.length > configuration[type])) {
		errors.push({message: `${type} name is too long. Length of ${stepText.length} is longer than the maximum allowed: ${configuration[type]}`,
			rule   : name,
			line   : location.line,
			column : location.column,
		});
	}
}

function testSteps(node: Background | Scenario, mergedConfiguration: Configuration, errors: RuleError[]) {
	node.steps.forEach(step => {
		// Check Step name length
		test(step.text, step.location, mergedConfiguration, 'Step', errors);
	});
}

export function run({feature}: GherkinData, configuration: Configuration): RuleError[] {
	if (!feature) {
		return [];
	}

	const errors = [] as RuleError[];
	const mergedConfiguration = _.merge(availableConfigs, configuration);

	// Check Feature name length
	test(feature.name, feature.location, mergedConfiguration, 'Feature', errors);

	const {children, rules} = featureSpread(feature);

	rules.forEach(rule => {
		test(rule.name, rule.location, mergedConfiguration, 'Rule', errors);
	});

	children.forEach(child => {
		if (child.background) {
			testSteps(child.background, mergedConfiguration, errors);
		} else {
			test(child.scenario.name, child.scenario.location, mergedConfiguration, 'Scenario', errors);
			testSteps(child.scenario, mergedConfiguration, errors);
		}
	});

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
