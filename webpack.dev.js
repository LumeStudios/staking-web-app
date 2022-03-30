const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    mode: 'development',
    devServer: {
        hot: false,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers':
                'X-Requested-With, content-type, Authorization'
        },
        allowedHosts: ['all'],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                CHAIN_ID: JSON.stringify('0x4'),
                CONTRACT_ADDRESS_TOKEN: JSON.stringify('0x14A0a083F3B9DE2B8B2FffbC6EE04F2AA443f7b1'),
                CONTRACT_ADDRESS_55: JSON.stringify("0x7f8eEAF32FBaDf0D7CD1a5D4cd09e97F51647149"),
                PROJECT_ID: JSON.stringify('61f073affc34b52c4ac0edf8'),
                SERVER: JSON.stringify('http://localhost:3001'),
                SERVER_SEAMORE: JSON.stringify('https://seamore.55unity.com'),
                AUTHENTICATION: JSON.stringify('a9a5d580243b9ee0ab8377695b573e3aa8877803ac2596067d4b8e4ac8254266')
            }
        })
    ]
});