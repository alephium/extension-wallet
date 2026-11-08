const path = require("path")

module.exports = [
  {
    // Use the reviewable CommonJS entry only in the page's realm. Layered
    // modules keep wallet/background SDK serialization behavior isolated.
    issuerLayer: "inpage",
    resolve: {
      alias: { "@alephium/web3$": require.resolve("@alephium/web3") },
    },
  },
  {
    test: /@alephium[\\/]web3[\\/]dist[\\/]src[\\/]index\.js$/,
    issuerLayer: "inpage",
    enforce: "pre",
    loader: path.resolve(__dirname, "inpage-web3-loader.js"),
  },
]
