import { BuildScriptTxResult, Script, SignerProvider } from '@alephium/web3'

const withdrawScriptArtifact = `{
  "name": "Withdraw",
  "bytecodeTemplate": "01010300000005{1}0d0c{0}0102",
  "fieldsSig": {
    "names": [
      "token",
      "amount"
    ],
    "types": [
      "ByteVec",
      "U256"
    ],
    "isMutable": [
      false,
      false
    ]
  },
  "functions": [
    {
      "name": "main",
      "usePreapprovedAssets": true,
      "useAssetsInContract": false,
      "isPublic": true,
      "paramNames": [],
      "paramTypes": [],
      "paramIsMutable": [],
      "returnTypes": []
    }
  ]
}`

const contractId = '557542e827e0849d8d9c94f93749464c288c8bb0e70bfe2e611c31952add684b'

export async function getToken(signerProvider: SignerProvider): Promise<BuildScriptTxResult> {
  const script = Script.fromJson(JSON.parse(withdrawScriptArtifact))
  return script.execute(signerProvider, {
    initialFields: {
      token: contractId,
      amount: BigInt(1)
    },
    // it will execute successfully if we remove the following line of code
    attoAlphAmount: BigInt(100)
  })
}
