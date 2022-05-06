const path = require('path');
const webpack = require('webpack')

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: {
            "electron": require.resolve("electron"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "url": require.resolve("url"),
            "assert": require.resolve("assert"),
            "buffer": require.resolve("buffer")
        },
        alias: {
            process: "process/browser"
        },
    },
    output: {
        filename: 'new_bundlev1.2.6.js',
        path: path.resolve(__dirname, 'dist')
    }
};