const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const buildRoot = path.resolve(__dirname, "lib");
const monacoEditorPath = 'node_modules/monaco-editor-core/dev/vs';
const monacoLanguagesPath = 'node_modules/monaco-languages/release';
const monacoCssLanguagePath = 'node_modules/monaco-css/release/min';
const monacoTsLanguagePath = 'node_modules/monaco-typescript/release';

module.exports = {
    entry: path.resolve(buildRoot, "main.js"),
    output: {
        filename: 'bundle.js',
        path: buildRoot
    },
    module: {
        noParse: /vscode-languageserver-types/,
        rules: [
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                loader: 'source-map-loader'
            }
        ],
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            'vs': path.resolve(buildRoot, monacoEditorPath)
        }
    },
    devtool: 'source-map',
    target: 'web',
    node: {
        fs: 'empty',
        child_process: 'empty',
        net: 'empty',
        crypto: 'empty'
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: monacoEditorPath,
                to: 'vs'
            },
            {
                from: monacoLanguagesPath,
                to: 'vs/basic-languages'
            },
            {
                from: monacoCssLanguagePath,
                to: 'vs/language/css'
            },
            {
                from: monacoTsLanguagePath,
                to: 'vs/language/typescript'
            }
        ])
    ]
}