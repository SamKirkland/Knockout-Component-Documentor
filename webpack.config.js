const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
	entry: './js/entry.js',
	watch: true,
	module: {
		rules: [
			{
				test: /\.html$/,
				use: ["html-loader"]
			},
			{
				test: /\.css$/,
				use: [{loader: "style-loader"}, {loader: "css-loader"}]
			},
			{
				test: /\.scss$/,
				use: [{loader: "style-loader"}, {loader: "css-loader"}, {loader: "sass-loader"}]
			}
		]
	},
	plugins: [
		new WebpackShellPlugin({
			onBuildEnd: ['npm run document-components']
		})
	],
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'knockout-component-documentor.bundle.js'
	}
};