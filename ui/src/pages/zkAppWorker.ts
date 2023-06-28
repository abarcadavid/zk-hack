import { Mina } from 'snarkyjs';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

import type { Add } from '../../../contracts/src/Add';

const state = {
  Add: null as null | typeof Add,
  zkApp: null as null | Add,
  transaction: null as null | Transaction
};

// -----------------------------------------------------------------------------

const functions = {
  setActiveInstanceToBerkeley: async (args: {}) => {
    const Berkeley = Mina.Network(
      'https://proxy.berkeley.minaexplorer.com/graphql'
    );
    Mina.setActiveInstance(Berkeley);
  },
};

// -----------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkAppWorkerRequest = {
  id: number,
  fn: WorkerFunctions,
  args: any
};

export type ZkAppWorkerResponse = {
  id: number,
  data: any,
};

// Check if we are on a server environment(window should be undefined)
if(typeof window === 'undefined') {
  addEventListener(
    'message',
    async (event: MessageEvent<ZkAppWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkAppWorkerResponse = {
        id: event.data.id,
        data: returnData
      }
      postMessage(message);
    }
  )

}