const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
	entry: './js/entry.ts',
	devtool: 'inline-source-map',
	watch: true,
	mode: "development",
	output: {
		filename: 'knockout-component-documentor.bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.ts?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
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
	resolve: {
		extensions: [".ts", ".js"]
	},
	plugins: [
		new WebpackShellPlugin({
			onBuildEnd: ['npm run document-components']
		})
	]
};