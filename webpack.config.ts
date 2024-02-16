import path from 'path';
import webpack, {DefinePlugin} from 'webpack'
import HtmlWebpackPlugin from "html-webpack-plugin";
import type {Configuration as DevServerConfiguration} from "webpack-dev-server";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import {BundleAnalyzerPlugin} from "webpack-bundle-analyzer";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import ReactRefreshTypeScript from 'react-refresh-typescript'
import CopyPlugin from "copy-webpack-plugin";

interface IMode {
    mode: 'production' | 'development',
    analyzer?: boolean
    platform?: 'mobile' | 'desktop'
}

const devServer: DevServerConfiguration = {}

const options = {
    port: 5000,
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
    output: path.resolve(__dirname, 'build'),
    html: path.resolve(__dirname, 'public', 'index.html'),
    public: path.resolve(__dirname, 'public')
    // mode: '',
}

export default (env: IMode) => {
    const isDev = env.mode === 'development'
    const isProd = env.mode === 'production'
    const isAnalyzer = env.analyzer
    const platform = env.platform ?? 'desktop'

    const config: webpack.Configuration = {
        mode: env.mode ?? "development",
        entry: options.entry,
        output: {
            path: options.output,
            filename: '[name].[contenthash].js',
            clean: true // очистка дериктории перед билдом
        },
        // плагин для добавления тега скрипт с соответствующим scr
        plugins: [
            new HtmlWebpackPlugin({template: options.html, favicon: path.resolve(options.public, 'favicon-16.png')}),
            isDev && new webpack.ProgressPlugin(), // показывает время сборки
            isProd && new MiniCssExtractPlugin({
                filename: "css/[name].[contenthash:8].css",
                chunkFilename: "css/[name].[contenthash:8].css",
            }),
            // анализатор бандла
            // new BundleAnalyzerPlugin()
            // глобальные переменные для исключения определенных частей кода из проекта
            new DefinePlugin({
                __PLATFORM__: JSON.stringify(platform),
                __ENV__: JSON.stringify(env.mode ?? "development")
            }),
            // компиляция TS в отдельном процессе
            isDev && new ForkTsCheckerWebpackPlugin(),
            // hot module replace
            isDev && new ReactRefreshWebpackPlugin(),
            // копирование файлов в указанную папку
            isProd && new CopyPlugin({
                patterns: [
                    { from: path.resolve(options.public, 'localizations'), to: path.resolve(options.output, 'localizations') },
                ],
            }),
        ],
        devtool: isDev && 'inline-source-map',
        module: {
            // обработка TS файлов
            // TS loader умеет работать с jsx
            // В противном случае пришлось бы устанавливать babel
            rules: [
                // обработка изображений
                {
                    test: /\.(png|jpg|jpeg|gif)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        // Creates `style` nodes from JS strings
                        isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                        // Translates CSS into CommonJS
                        {
                            loader: "css-loader",
                            options: {
                                modules: {
                                    // указание пути к стилю в dev режиме вместо хэшей файлов
                                    localIdentName: isDev ? '[path][name]__[local]' : '[hash:base64:8]'
                                },
                            },
                        },
                        // Compiles Sass to CSS
                        "sass-loader",
                    ],
                },
                {
                    exclude: /node_modules/,
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                // hot module replace
                                getCustomTransformers: () => ({
                                    before: [isDev && ReactRefreshTypeScript()].filter(Boolean),
                                }),
                                transpileOnly: true // лоадер будет осуществлять только компиляцию TS, проверки типов будут отключены
                            }
                        }
                    ]
                },
                // обработка svg
                {
                    test: /\.svg$/i,
                    issuer: /\.[jt]sx?$/,
                    use: [
                        {
                            loader: '@svgr/webpack',
                            options: {
                                icon: true,
                                // позволяет менять цвет svg в пропасах в рантайме
                                svgoConfig: {plugins: [{name: 'convertColors', params: {currentColor: true}}]}
                            }
                        }],
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            alias: {
                '@': path.resolve(__dirname, 'src')
            }
        },
        devServer: isDev ? {
            open: true,
            port: options.port,
            // если раздавать статику через nginx, то необходимо делать проксирование на index.html
            historyApiFallback: true, // для корректной работы роутинга react-router-dom
            hot: true, // hot module replace
        } : undefined,

    };

    return config
}