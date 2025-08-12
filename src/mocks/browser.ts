import { setupWorker,  } from 'msw/browser';
import { handlersV2 } from './handlers-v2';

// Service Workerの設定
export const worker = setupWorker(...handlersV2);