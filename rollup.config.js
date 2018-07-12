import util from 'lodash';
import pkg from './package.json';

import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const external = util.chain({})
	.assign(pkg.dependencies)
	.keys()
	.value();

export default {
	input: pkg['main.src'],
	plugins: [
		babel({
			exclude: 'node_modules/**'
		}),
		resolve(),
		commonjs(),
	],
	external: external,
	output: {
		name: pkg['browser.var'],
		file: pkg['browser.main'],
		format: pkg['browser.format'],
		globals: {
			lodash: '_',
			react: 'React',
			'prop-types': 'PropTypes',
		},
	},
};
