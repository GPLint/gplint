var _ = require('lodash');
var rule = 'allowed-tags';
var availableConfigs = {
  'tags': []
};

function run(feature, fileName, configuration) {
  if (!feature) {
    return [];
  }

  var errors = [];
  var allowedTags = configuration.tags;
  
  if (feature.children) {
    feature.children.forEach(function(child) {
      if (child.scenario) {
        checkTags(child.scenario, allowedTags, errors);

        if (child.scenario.examples) {
          child.scenario.examples.forEach(function(example) {
            checkTags(example, allowedTags, errors);
          });
        }
      }      
    });
  }

  return errors;
}

function checkTags(node, allowedTags, errors) {
  return (node.tags || [])
    .filter(function(tag) {
      return !isAllowed(tag, allowedTags);
    })
    .forEach(function(tag) {
      errors.push(createError(node, tag));
    });
}

function isAllowed(tag, allowedTags) {
  return _.includes(allowedTags, tag.name);
}

function createError(node, tag) {
  return {
    message: 'Not allowed tag ' + tag.name + ' on ' + node.keyword,
    rule   : rule,
    line   : tag.location.line
  };
}

module.exports = {
  name: rule,
  run: run,
  availableConfigs: availableConfigs
};
