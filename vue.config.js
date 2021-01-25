// const webpack = require('webpack');

module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: ['fluent-ffmpeg','ffmpeg-static','ffprobe-static'],
      builderOptions: {
        "asar": false
      }
    }
  },
  configureWebpack: {
    plugins: [
      // new webpack.DefinePlugin({
      //   'process.env.FLUENTFFMPEG_COV': false
      // })
    ]
  }
}