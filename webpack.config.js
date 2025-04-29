const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: './src/main.js', // Entry point for your React app
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'dist'),
            clean: true, // Cleans the dist folder before each build
        },
        mode: isProduction ? 'production' : 'development', // Dynamically set mode
        devServer: {
            static: {
                directory: path.resolve(__dirname, 'dist'),
            },
            port: 3000,
            open: true,
            hot: true,
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/, // Support for .js and .jsx files
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                    },
                },
                {
                    test: /\.css$/, // Support for CSS files
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg)$/, // Support for image files
                    type: 'asset/resource',
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.jsx'], // Resolve .js and .jsx extensions
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html', // Use the index.html from src
                minify: isProduction
                    ? {
                          collapseWhitespace: true,
                          removeComments: true,
                          removeRedundantAttributes: true,
                          useShortDoctype: true,
                          removeEmptyAttributes: true,
                          removeStyleLinkTypeAttributes: true,
                          keepClosingSlash: true,
                          minifyJS: true,
                          minifyCSS: true,
                          minifyURLs: true,
                      }
                    : false,
            }),
        ],
    };
};