import path from 'path';
import webpack from 'webpack'
import HtmlWebpackPlugin from "html-webpack-plugin";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import {BundleAnalyzerPlugin} from "webpack-bundle-analyzer";

interface IMode {
    mode: 'production' | 'development',
    analyzer?: boolean
}

const devServer: DevServerConfiguration = {

}

const options = {
    port: 5000,
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
    output: path.resolve(__dirname, 'build'),
    html: path.resolve(__dirname, 'public', 'index.html')
    // mode: '',
}

export default (env: IMode) => {
    const isDev = env.mode === 'development'
    const isProd = env.mode === 'production'
    const isAnalyzer = env.analyzer

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
            new HtmlWebpackPlugin({template: options.html}),
            isDev && new webpack.ProgressPlugin(), // показывает время сборки
            isProd && new MiniCssExtractPlugin({
                filename: "css/[name].[contenthash:8].css",
                chunkFilename: "css/[name].[contenthash:8].css",
            }),
            // анализатор бандла
            isAnalyzer && new BundleAnalyzerPlugin()
        ],
        devtool: isDev && 'inline-source-map',
        module: {
            // обработка TS файлов
            // TS loader умеет работать с jsx
            // В противном случае пришлось бы устанавливать babel
            rules: [
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
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        devServer: isDev ? {
            open: true,
            port: options.port,
            // если раздавать статику через nginx, то необходимо делать проксирование на index.html
            historyApiFallback: true // для корректной работы роутинга react-router-dom
        } : undefined,

    };

    return config
}