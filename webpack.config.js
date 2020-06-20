const { resolve } = require( 'path' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );
const ReactRefreshWebpackPlugin = require( '@pmmmwh/react-refresh-webpack-plugin' );

const isDevelopment = process.env.NODE_ENV === 'development';
module.exports = {
	mode: isDevelopment ? 'development' : 'production',
	entry: './src/index.js',
	output: {
		filename: 'main.js',
		path: resolve( __dirname, 'dist' ),
		publicPath: '/',
	},
	devServer: {
		contentBase: './dist',
		index: 'index.html',
		historyApiFallback: true,
		hot: true,
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin( {
			title: 'AsBlocks, encrypted collaborative writing environment',
		} ),
		isDevelopment && new ReactRefreshWebpackPlugin(),
	].filter( Boolean ),
	module: {
		rules: [
			{
				test: /\.js$/,
				oneOf: [
					{
						resourceQuery: /\?source=node_modules/,
						use: {
							loader: 'babel-loader',
						},
					},
					{
						loader: 'path-replace-loader',
						options: {
							path: resolve(
								__dirname,
								'node_modules/@wordpress'
							),
							replacePath: resolve(
								__dirname,
								'src/override_modules/@wordpress'
							),
						},
					},
				],
			},
			{
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader' ],
			},
			{
				test: /\.m?js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
				},
			},
		],
	},
};
