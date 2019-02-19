const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
	entry: './js/entry.js',
	watch: true,
	mode: "development",
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'knockout-component-documentor.bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.html$/,
				use: [
					{
						loader: "html-loader",
						options: { minimize: false }
					}
				]
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				],
			},
			{
				test: /\.scss$/,
				use: [
					"style-loader",
					"css-loader",
					"sass-loader"
				]
			}
		]
	},
	plugins: [
		new WebpackShellPlugin({
			onBuildEnd: ['npm run document-components']
		})
	]
};