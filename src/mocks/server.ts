import { setupServer } from "msw/node"
import { handlersV2 } from './handlers-v2';

export const server = setupServer(...handlersV2)