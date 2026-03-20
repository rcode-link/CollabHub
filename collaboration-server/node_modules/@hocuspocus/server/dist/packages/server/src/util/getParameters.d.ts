/// <reference types="node" />
/// <reference types="node" />
import { IncomingMessage } from 'http';
import { URLSearchParams } from 'url';
/**
   * Get parameters by the given request
   */
export declare function getParameters(request?: Pick<IncomingMessage, 'url'>): URLSearchParams;
