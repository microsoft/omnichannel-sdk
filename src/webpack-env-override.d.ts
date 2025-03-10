/* eslint-disable @typescript-eslint/no-empty-interface */
import 'node';

declare namespace NodeJS {
    interface Module {}
    interface Require {}
}

declare const module: NodeJS.Module;
declare const require: NodeJS.Require;