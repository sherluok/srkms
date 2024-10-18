import { default as ForkTsCheckerPlugin } from 'fork-ts-checker-webpack-plugin';
import { ok } from 'node:assert';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { DefinePlugin, webpack, type Compiler, type Stats } from 'webpack';

if (require.main === module) {
  switch (process.argv[2]) {
    case 'watch': {
      watch();
      break;
    }
    case 'build': {
      build();
      break;
    }
    default: {
      process.exit(1);
    }
  }
}

function watch() {
  const compiler = createWebpackCompiler(false);
  compiler.watch({}, runCallback);
}

function build() {
  const compiler = createWebpackCompiler(true);
  compiler.run(runCallback);
}


function runCallback(error: Error | null, stats: Stats | undefined) {
  if (error || !stats) {
    console.error(String(error));
  } else {
    console.log(stats.toString({ colors: true, preset: 'normal' }));
  }
}

// 参考 https://github.com/microsoft/vscode-extension-samples/blob/main/webpack-sample/webpack.config.js，
// 成功运行的关键点在于 `output.libraryTarget` 和 `externals.vscode` 配置。
function createWebpackCompiler(production: boolean): Compiler {
  ok(process.env.ORIGIN);
  console.log('process.env.ORIGIN:', process.env.ORIGIN);

  return webpack({
    target: 'node',
    context: process.cwd(),
    mode: production ? 'production' : 'development',
    devtool: 'source-map',
    entry: {
      'extension': resolve('src/extension.ts'),
    },
    output: {
      clean: true,
      path: resolve('.build'),
      libraryTarget: 'commonjs2',
      filename: '[name].js',
      chunkFilename: '[contenthash].js',
      sourceMapFilename: '[name].json',
      assetModuleFilename: '[contenthash][ext]',
      cssFilename: '[contenthash].css',
      cssChunkFilename: '[contenthash].css',
      devtoolModuleFilenameTemplate: (info: any) => pathToFileURL(info.absoluteResourcePath),
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx'],
      mainFields: ['module', 'main'],
      plugins: [
        new TsconfigPathsPlugin({}),
      ],
    },
    externals: [
      {
        vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        rxjs: 'commonjs rxjs',
      },
      (ctx, callback) => {
        if (!(ctx.context && ctx.request && ctx.getResolve)) {
          callback();
          return;
        }
        if (!ctx.context.startsWith(process.cwd())) {
          callback();
          return;
        }
        ctx.getResolve()(ctx.context, ctx.request, (error, result) => {
          // console.log('context: %s, request: %s -> %s', ctx.context, ctx.request, result, error);
          const externalFiles = [
            resolve('.prisma/client/index.js'),
          ];
          if (result && externalFiles.includes(result)) {
            callback(null, `commonjs ${result}`);
          } else {
            callback();
          }
        });
      },
    ],
    plugins: [
      new DefinePlugin({
        ORIGIN: JSON.stringify(process.env.ORIGIN),
      }),
      new ForkTsCheckerPlugin({}),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/i,
          use: {
            loader: require.resolve('ts-loader'),
            options: { // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#options
              transpileOnly: true, // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#transpileonly
              compilerOptions: { // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#compileroptions
                sourceMap: true,
                target: 'es2022',
              },
            },
          },
        },
      ],
    },
  });
}
