/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Address,
  Asset,
  CallContractParams,
  CallContractResult,
  Contract,
  ContractEvent,
  ContractFactory,
  ContractInstance,
  ContractState,
  EventSubscribeOptions,
  EventSubscription,
  HexString,
  SignExecuteContractMethodParams,
  SignExecuteScriptTxResult,
  TestContractParams,
  TestContractParamsWithoutMaps,
  TestContractResult,
  TestContractResultWithoutMaps,
  addStdIdToFields,
  callMethod,
  encodeContractFields,
  fetchContractState,
  getContractEventsCurrentCount,
  multicallMethods,
  signExecuteMethod,
  subscribeContractEvent,
  subscribeContractEvents,
  testMethod,
} from "@alephium/web3";

import { default as ShinyTokenContractJson } from "../ShinyToken.ral.json";
import { getContractByCodeHash } from "./contracts";

// Custom types for the contract
export namespace ShinyTokenTypes {
  export type Fields = {
    symbol: HexString;
    name: HexString;
    decimals: bigint;
    totalSupply: bigint;
  };

  export type State = ContractState<Fields>;

  export interface CallMethodTable {
    getSymbol: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getName: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getDecimals: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getTotalSupply: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    transfer: {
      params: CallContractParams<{ to: Address; amount: bigint }>;
      result: CallContractResult<null>;
    };
    destroy: {
      params: CallContractParams<{ to: Address }>;
      result: CallContractResult<null>;
    };
  }
  export type CallMethodParams<T extends keyof CallMethodTable> =
    CallMethodTable[T]["params"];
  export type CallMethodResult<T extends keyof CallMethodTable> =
    CallMethodTable[T]["result"];
  export type MultiCallParams = Partial<{
    [Name in keyof CallMethodTable]: CallMethodTable[Name]["params"];
  }>;
  export type MultiCallResults<T extends MultiCallParams> = {
    [MaybeName in keyof T]: MaybeName extends keyof CallMethodTable
      ? CallMethodTable[MaybeName]["result"]
      : undefined;
  };
  export type MulticallReturnType<Callss extends MultiCallParams[]> = {
    [index in keyof Callss]: MultiCallResults<Callss[index]>;
  };

  export interface SignExecuteMethodTable {
    getSymbol: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getName: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getDecimals: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getTotalSupply: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    transfer: {
      params: SignExecuteContractMethodParams<{ to: Address; amount: bigint }>;
      result: SignExecuteScriptTxResult;
    };
    destroy: {
      params: SignExecuteContractMethodParams<{ to: Address }>;
      result: SignExecuteScriptTxResult;
    };
  }
  export type SignExecuteMethodParams<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["params"];
  export type SignExecuteMethodResult<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["result"];
}

class Factory extends ContractFactory<
  ShinyTokenInstance,
  ShinyTokenTypes.Fields
> {
  encodeFields(fields: ShinyTokenTypes.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      []
    );
  }

  at(address: string): ShinyTokenInstance {
    return new ShinyTokenInstance(address);
  }

  tests = {
    getSymbol: async (
      params: Omit<
        TestContractParamsWithoutMaps<ShinyTokenTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getSymbol", params, getContractByCodeHash);
    },
    getName: async (
      params: Omit<
        TestContractParamsWithoutMaps<ShinyTokenTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getName", params, getContractByCodeHash);
    },
    getDecimals: async (
      params: Omit<
        TestContractParamsWithoutMaps<ShinyTokenTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getDecimals", params, getContractByCodeHash);
    },
    getTotalSupply: async (
      params: Omit<
        TestContractParamsWithoutMaps<ShinyTokenTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getTotalSupply", params, getContractByCodeHash);
    },
    transfer: async (
      params: TestContractParamsWithoutMaps<
        ShinyTokenTypes.Fields,
        { to: Address; amount: bigint }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "transfer", params, getContractByCodeHash);
    },
    destroy: async (
      params: TestContractParamsWithoutMaps<
        ShinyTokenTypes.Fields,
        { to: Address }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "destroy", params, getContractByCodeHash);
    },
  };

  stateForTest(
    initFields: ShinyTokenTypes.Fields,
    asset?: Asset,
    address?: string
  ) {
    return this.stateForTest_(initFields, asset, address, undefined);
  }
}

// Use this object to test and deploy the contract
export const ShinyToken = new Factory(
  Contract.fromJson(
    ShinyTokenContractJson,
    "",
    "9bdc139154d4e611dd391a5b262cc081d2519b9a3ccc95df943a98a9e3c67661",
    []
  )
);

// Use this class to interact with the blockchain
export class ShinyTokenInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<ShinyTokenTypes.State> {
    return fetchContractState(ShinyToken, this);
  }

  view = {
    getSymbol: async (
      params?: ShinyTokenTypes.CallMethodParams<"getSymbol">
    ): Promise<ShinyTokenTypes.CallMethodResult<"getSymbol">> => {
      return callMethod(
        ShinyToken,
        this,
        "getSymbol",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getName: async (
      params?: ShinyTokenTypes.CallMethodParams<"getName">
    ): Promise<ShinyTokenTypes.CallMethodResult<"getName">> => {
      return callMethod(
        ShinyToken,
        this,
        "getName",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getDecimals: async (
      params?: ShinyTokenTypes.CallMethodParams<"getDecimals">
    ): Promise<ShinyTokenTypes.CallMethodResult<"getDecimals">> => {
      return callMethod(
        ShinyToken,
        this,
        "getDecimals",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getTotalSupply: async (
      params?: ShinyTokenTypes.CallMethodParams<"getTotalSupply">
    ): Promise<ShinyTokenTypes.CallMethodResult<"getTotalSupply">> => {
      return callMethod(
        ShinyToken,
        this,
        "getTotalSupply",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    transfer: async (
      params: ShinyTokenTypes.CallMethodParams<"transfer">
    ): Promise<ShinyTokenTypes.CallMethodResult<"transfer">> => {
      return callMethod(
        ShinyToken,
        this,
        "transfer",
        params,
        getContractByCodeHash
      );
    },
    destroy: async (
      params: ShinyTokenTypes.CallMethodParams<"destroy">
    ): Promise<ShinyTokenTypes.CallMethodResult<"destroy">> => {
      return callMethod(
        ShinyToken,
        this,
        "destroy",
        params,
        getContractByCodeHash
      );
    },
  };

  transact = {
    getSymbol: async (
      params: ShinyTokenTypes.SignExecuteMethodParams<"getSymbol">
    ): Promise<ShinyTokenTypes.SignExecuteMethodResult<"getSymbol">> => {
      return signExecuteMethod(ShinyToken, this, "getSymbol", params);
    },
    getName: async (
      params: ShinyTokenTypes.SignExecuteMethodParams<"getName">
    ): Promise<ShinyTokenTypes.SignExecuteMethodResult<"getName">> => {
      return signExecuteMethod(ShinyToken, this, "getName", params);
    },
    getDecimals: async (
      params: ShinyTokenTypes.SignExecuteMethodParams<"getDecimals">
    ): Promise<ShinyTokenTypes.SignExecuteMethodResult<"getDecimals">> => {
      return signExecuteMethod(ShinyToken, this, "getDecimals", params);
    },
    getTotalSupply: async (
      params: ShinyTokenTypes.SignExecuteMethodParams<"getTotalSupply">
    ): Promise<ShinyTokenTypes.SignExecuteMethodResult<"getTotalSupply">> => {
      return signExecuteMethod(ShinyToken, this, "getTotalSupply", params);
    },
    transfer: async (
      params: ShinyTokenTypes.SignExecuteMethodParams<"transfer">
    ): Promise<ShinyTokenTypes.SignExecuteMethodResult<"transfer">> => {
      return signExecuteMethod(ShinyToken, this, "transfer", params);
    },
    destroy: async (
      params: ShinyTokenTypes.SignExecuteMethodParams<"destroy">
    ): Promise<ShinyTokenTypes.SignExecuteMethodResult<"destroy">> => {
      return signExecuteMethod(ShinyToken, this, "destroy", params);
    },
  };

  async multicall<Callss extends ShinyTokenTypes.MultiCallParams[]>(
    ...callss: Callss
  ): Promise<ShinyTokenTypes.MulticallReturnType<Callss>> {
    return (await multicallMethods(
      ShinyToken,
      this,
      callss,
      getContractByCodeHash
    )) as ShinyTokenTypes.MulticallReturnType<Callss>;
  }
}
