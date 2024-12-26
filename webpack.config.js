const nodeExternals = require('webpack-node-externals')
const path = require('path')
module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    externals: [nodeExternals()],
    target: 'node',
    mode: 'production',
    optimization: {
        minimize: true,
        nodeEnv: 'production'
    }
}