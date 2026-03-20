import { ExecutionContext } from 'ava';
export declare const retryableAssertion: (t: ExecutionContext, recoverableTry: (tt: ExecutionContext) => void) => Promise<void>;
