const assert = require("node:assert/strict")
const fs = require("node:fs/promises")
const os = require("node:os")
const path = require("node:path")
const webpack = require("webpack")
const { JSDOM } = require("jsdom")

async function main() {
  const output = await fs.mkdtemp(path.join(os.tmpdir(), "alephium-inpage-"))
  try {
    const compiler = webpack({
      mode: "development",
      devtool: false,
      context: path.resolve(__dirname, ".."),
      entry: { inpage: { import: "./src/inpage", layer: "inpage" } },
      experiments: { layers: true },
      output: { path: output, filename: "inpage.js" },
      module: {
        rules: [
          ...require("../build/inpage-web3-rules"),
          {
            test: /\.tsx?$/,
            loader: "esbuild-loader",
            options: { loader: "tsx" },
          },
        ],
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js"],
        fallback: {
          crypto: false,
          fs: false,
          stream: require.resolve("stream-browserify"),
          buffer: require.resolve("buffer/"),
          vm: false,
        },
      },
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        }),
        new webpack.DefinePlugin({
          "process.env.VERSION": JSON.stringify("test"),
        }),
      ],
    })
    await new Promise((resolve, reject) =>
      compiler.run((error, stats) => {
        compiler.close(() => {})
        if (error || stats.hasErrors())
          reject(
            error || new Error(stats.toString({ all: false, errors: true })),
          )
        else resolve()
      }),
    )
    const source = await fs.readFile(path.join(output, "inpage.js"), "utf8")
    if (process.argv[2]) await fs.writeFile(process.argv[2], source)
    for (const customHook of [false, true]) {
      const dom = new JSDOM(
        "<!doctype html><script id='alephium-extension' data-extension-id='test'></script>",
        {
          url: "https://example.org",
          runScripts: "outside-only",
          pretendToBeVisual: true,
        },
      )
      try {
        dom.window.TextEncoder = TextEncoder
        dom.window.TextDecoder = TextDecoder
        if (customHook)
          dom.window.eval(
            "Object.defineProperty(BigInt.prototype, 'toJSON', { value() { return 'site-owned' }, configurable: false, writable: false })",
          )
        const before = Object.getOwnPropertyDescriptor(
          dom.window.BigInt.prototype,
          "toJSON",
        )
        dom.window.eval(source)
        assert.ok(dom.window.alephiumProviders.alephium)
        assert.deepEqual(
          Object.getOwnPropertyDescriptor(
            dom.window.BigInt.prototype,
            "toJSON",
          ),
          before,
        )
        if (customHook)
          assert.equal(dom.window.eval("JSON.stringify(1n)"), '"site-owned"')
        else
          assert.throws(() => dom.window.eval("JSON.stringify(1n)"), /BigInt/)
      } finally {
        dom.window.close()
      }
    }
    console.log(
      "Injected provider preserves native and site-owned BigInt behavior",
    )
  } finally {
    await fs.rm(output, { recursive: true, force: true })
  }
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
