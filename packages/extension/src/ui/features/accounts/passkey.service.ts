import { binToHex, hexToBinUnsafe } from "@alephium/web3"
import { ArrayStorage } from "../../../shared/storage"
import { AuthenticationCredential, RegistrationCredential } from "@simplewebauthn/typescript-types"
import { toHash, decodeAttestationObject, parseAuthenticatorData, isoCBOR, cose } from "@simplewebauthn/server/helpers"
import { randomBytes } from "crypto"
import * as elliptic from 'elliptic'
import { Account } from "./Account"
import { AsnParser } from '@peculiar/asn1-schema'
import { ECDSASigValue } from '@peculiar/asn1-ecc'

export interface PasskeyWallet {
  rawId: string
  publicKey: string
}

export const passkeyWalletStore = new ArrayStorage<PasskeyWallet>([], { namespace: "core:passkeyWallets" })

const getAllPasskeyWallets = async () => {
  return await passkeyWalletStore.get()
}

const curve = new elliptic.ec('p256');

function compressPublicKey(x: Uint8Array, y: Uint8Array): Uint8Array {
  const key = curve.keyFromPublic({ x: binToHex(x), y: binToHex(y) }, 'hex');
  const compressedPublicKey = new Uint8Array(Buffer.from(key.getPublic(true, 'hex'), 'hex'));
  return compressedPublicKey;
}

// TODO: support create passkey account with group
export const createPasskeyAccount = async (networkId: string, walletName: string) => {
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(32),
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      rp: { name: 'alephium-extension-wallet' },
      user: {
        name: walletName,
        displayName: walletName,
        id: randomBytes(16)
      }
    }
  }) as RegistrationCredential
  // TODO: verify the credential
  const decodedAttestationObject = decodeAttestationObject(new Uint8Array(credential.response.attestationObject))
  const authData = decodedAttestationObject.get('authData')
  const parsedAuthData = parseAuthenticatorData(authData)
  if (parsedAuthData.credentialPublicKey === undefined) {
    throw new Error('Credential public key is undefined')
  }
  const credentialPublicKey = parsedAuthData.credentialPublicKey
  const key = isoCBOR.decodeFirst<cose.COSEPublicKey>(credentialPublicKey) as cose.COSEPublicKeyEC2
  const x = key.get(cose.COSEKEYS.x)
  const y = key.get(cose.COSEKEYS.y)
  if (x === undefined || y === undefined) {
    throw new Error('Invalid credential public key')
  }
  const publicKey = binToHex(compressPublicKey(x, y))
  const passkeyWallet = { rawId: binToHex(new Uint8Array(credential.rawId)), publicKey }
  await passkeyWalletStore.push([passkeyWallet])
  return Account.createPasskey(networkId, publicKey)
}

const getPasskeyWalletByPublicKey = async (publicKey: string) => {
  const wallets = await getAllPasskeyWallets()
  return wallets.find((w) => w.publicKey.toLowerCase() === publicKey.toLowerCase())
}

export const signWithPasskey = async (account: Account, txId: string) => {
  const passkeyWallet = await getPasskeyWalletByPublicKey(account.publicKey)
  if (passkeyWallet === undefined) {
    throw new Error(`Passkey wallet does not exist, address: ${account.address}`)
  }
  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: hexToBinUnsafe(txId),
      allowCredentials: [{ id: hexToBinUnsafe(passkeyWallet.rawId), type: "public-key" }]
    }
  }) as AuthenticationCredential
  // TODO: return the clientData and authenticatorData
  return binToHex(unwrapEC2Signature(new Uint8Array(credential.response.signature)))
}

function unwrapEC2Signature(signature: Uint8Array): Uint8Array {
  const parsedSignature = AsnParser.parse(signature, ECDSASigValue)
  let rBytes = new Uint8Array(parsedSignature.r)
  let sBytes = new Uint8Array(parsedSignature.s)

  if (shouldRemoveLeadingZero(rBytes)) {
    rBytes = rBytes.slice(1)
  }

  if (shouldRemoveLeadingZero(sBytes)) {
    sBytes = sBytes.slice(1)
  }

  return new Uint8Array([...rBytes, ...sBytes])
}

function shouldRemoveLeadingZero(bytes: Uint8Array): boolean {
  return bytes[0] === 0x0 && (bytes[1] & (1 << 7)) !== 0
}

export const importPasskey = async (networkId: string) => {
  const challenge = randomBytes(32)
  const credential = await navigator.credentials.get({
    publicKey: { challenge }
  }) as AuthenticationCredential
  const clientDataHash = await toHash(new Uint8Array(credential.response.clientDataJSON))
  const authenticatorData = new Uint8Array(credential.response.authenticatorData)
  const data = new Uint8Array([...authenticatorData, ...clientDataHash])
  const dataHash = await toHash(data)
  const signature = unwrapEC2Signature(new Uint8Array(credential.response.signature))
  let publicKey: string | undefined = undefined
  for (let i = 0; i < 4; i++) {
    const r = signature.subarray(0, 32)
    const s = signature.subarray(32, 64)
    try {
      const result = curve.recoverPubKey(dataHash, { r, s }, i)
      publicKey = result.encode('hex', true)
      break
    } catch (_) { /* empty */ }
  }
  if (publicKey === undefined) {
    throw new Error(`Failed to recover the public key`)
  }
  const passkeyWallet = { rawId: binToHex(new Uint8Array(credential.rawId)), publicKey }
  await passkeyWalletStore.push([passkeyWallet])
  return Account.createPasskey(networkId, publicKey)
}
