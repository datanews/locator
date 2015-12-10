import babel from 'rollup-plugin-babel';

export default {
	entry: 'src/ractive-events-tap.js',
	plugins: [ babel() ],
	moduleName: 'Ractive.events.tap'
};
