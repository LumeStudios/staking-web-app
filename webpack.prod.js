const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    devtool: 'source-map',
    mode: 'production',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                CHAIN_ID: JSON.stringify('0x1'),
                CONTRACT_ADDRESS_TOKEN: JSON.stringify('0xFBB3c73779Ef59F0C4A2e662F9A42A82a145e638'),
                CONTRACT_ADDRESS_55: JSON.stringify("0xD8723058f2B456484E3cdE4ccfaeA903116fA9e4"),
                PROJECT_ID: JSON.stringify('62182600ca0013b6790f02e5'),
                SERVER: JSON.stringify('https://server.55unity.com'),
                SERVER_SEAMORE: JSON.stringify('https://seamore.55unity.com'),
                AUTHENTICATION: JSON.stringify('a9a5d580243b9ee0ab8377695b573e3aa8877803ac2596067d4b8e4ac8254266'),
                CONTRACT_ADDRESS_TOXIC_POWER: JSON.stringify('0xA57C9Ec71EaB1aEe7A37A09011C7d8C93D353ad8')
            }
        })
    ]
});