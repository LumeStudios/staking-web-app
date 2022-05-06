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
                CONTRACT_ADDRESS_TOKEN: JSON.stringify('0x9F3C5fADB522A45951A3598B72f86a93d897dCA2'),
                CONTRACT_ADDRESS_55: JSON.stringify("0x7f8eEAF32FBaDf0D7CD1a5D4cd09e97F51647149"),
                PROJECT_ID: JSON.stringify('61f073affc34b52c4ac0edf8'),
                SERVER: JSON.stringify('http://localhost:3001'),
                SERVER_SEAMORE: JSON.stringify('https://seamore.55unity.com'),
                AUTHENTICATION: JSON.stringify('a9a5d580243b9ee0ab8377695b573e3aa8877803ac2596067d4b8e4ac8254266'),
                CONTRACT_ADDRESS_TOXIC_POWER: JSON.stringify('0x4AFf043720f7aE277f4Ab03a5aB27c311dd789A8'),
                CONTRACT_ADDRESS_CLAIM: JSON.stringify('0xc806d2A0220AE7ebd95d267C1103971062f47d39')
            }
        })
    ]
});