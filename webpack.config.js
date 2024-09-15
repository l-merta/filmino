const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    home: './src/home.tsx',
    movies: './src/movies.tsx',
    video_movie: './src/video_movie.tsx',
    zanr_movie: './src/zanr_movie.tsx',
    search_movie: './src/search_movie.tsx',
    herec_movie: './src/herec_movie.tsx',
    tv: './src/tv.tsx',
    video_tv: './src/video_tv.tsx',
    zanr_tv: './src/zanr_tv.tsx',
    search_gv: './src/search_tv.tsx',
    herec_tv: './src/herec_tv.tsx',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './index.html',
      chunks: ['home'],
    }),
    new HtmlWebpackPlugin({
      filename: 'filmy/index.html',
      template: './filmy/index.html',
      chunks: ['movies'],
    }),
    new HtmlWebpackPlugin({
      filename: 'filmy/video.html',
      template: './filmy/video.html',
      chunks: ['video_movie'],
    }),
    new HtmlWebpackPlugin({
      filename: 'filmy/zanr.html',
      template: './filmy/zanr.html',
      chunks: ['zanr_movie'],
    }),
    new HtmlWebpackPlugin({
      filename: 'filmy/search.html',
      template: './filmy/search.html',
      chunks: ['search_movie'],
    }),
    new HtmlWebpackPlugin({
      filename: 'filmy/herec.html',
      template: './filmy/herec.html',
      chunks: ['herec_movie'],
    }),
    new HtmlWebpackPlugin({
      filename: 'serialy/index.html',
      template: './serialy/index.html',
      chunks: ['tv'],
    }),
    new HtmlWebpackPlugin({
      filename: 'serialy/video.html',
      template: './serialy/video.html',
      chunks: ['video_tv'],
    }),
    new HtmlWebpackPlugin({
      filename: 'serialy/zanr.html',
      template: './serialy/zanr.html',
      chunks: ['zanr_tv'],
    }),
    new HtmlWebpackPlugin({
      filename: 'serialy/search.html',
      template: './serialy/search.html',
      chunks: ['search_tv'],
    }),
    new HtmlWebpackPlugin({
      filename: 'serialy/herec.html',
      template: './serialy/herec.html',
      chunks: ['herec_tv'],
    }),
  ],
};
