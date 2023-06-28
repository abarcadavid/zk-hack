import type {
  ZkAppWorkerRequest,
  ZkAppWorkerResponse,
  WorkerFunctions
} from "./zkAppWorker";

export default class ZkAppWorkerClient {
  setActiveInstanceToBerkeley() {
    return this._call('setActiveInstanceToBerkeley', {})
  }

  worker: Worker;
  promises: {[id: number]: {resolve: (res: any) => void, reject: (err: any) => void}}
  nextId: number;

  constructor() {
    this.worker = new Worker(new URL('./zkAppWorker.ts', import.meta.url));
    this.promises = {};
    this.nextId = 0;

    this.worker.onmessage = (event: MessageEvent<ZkAppWorkerResponse>) => {
      this.promises[event.data.id].resolve(event.data.data);
      delete this.promises[event.data.id];
    };
  }

  _call(fn: WorkerFunctions, args: any) {
    return new Promise((resolve, reject) => {
      this.promises[this.nextId] = { resolve, reject }

      const message: ZkAppWorkerRequest = {
        id: this.nextId,
        fn,
        args
      };

      this.worker.postMessage(message);
      this.nextId++;
    })
  }
}
