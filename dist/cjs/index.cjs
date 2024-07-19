'use strict';

var I18n = require('./I18n.cjs');
var composable = require('./composable.cjs');
var utils = require('./utils.cjs');



exports.createI18n = I18n.createI18n;
exports.useI18n = composable.useI18n;
exports.compileWithCustomDirectives = utils.compileWithCustomDirectives;
