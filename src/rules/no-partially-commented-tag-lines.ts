import { GherkinData, GherkinTaggable, RuleError, RuleSubConfig } from '../types.js';
import { featureSpread } from './utils/gherkin.js';
import _ from 'lodash';

export const name = 'no-partially-commented-tag-lines';

export const availableConfigs = {
	allowSeparated: true
};

export function run({file, feature}: GherkinData, configuration: RuleSubConfig<typeof availableConfigs>): RuleError[] {
	if (!feature) {
		return [];
	}

	const mergedConfig = _.merge({}, availableConfigs, configuration);

	function checkTags(node: GherkinTaggable) {
		if (mergedConfig.allowSeparated) {
			node.tags.forEach(tag => {
				if (tag.name.indexOf('#') > 0) {
					errors.push({
						message: 'Partially commented tag lines not allowed',
						rule   : name,
						line   : tag.location.line,
						column : tag.location.column,
					});
				}
			});
		} else {
			_.uniqBy(node.tags.map(tag => tag), 'location.line').forEach(tag => {
				if (file.lines[tag.location.line - 1].includes('#')) {
					errors.push({
						message: 'Partially commented tag lines not allowed',
						rule   : name,
						line   : tag.location.line,
						column : tag.location.column,
					});
				}
			});
		}
	}

	const errors = [] as RuleError[];

	checkTags(feature);

	const {children, rules} = featureSpread(feature);

	rules.forEach(rule => {
		checkTags(rule);
	});

	children.forEach(child => {
		if (child.scenario) {
			checkTags(child.scenario);

			child.scenario.examples.forEach(example => {
				checkTags(example);
			});
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
