import {Request, Response, NextFunction} from "express";

declare interface IActionParams {
    req: Request,
    res: Response,
    next: NextFunction,
}

declare type ActionFn = (actionParams: IActionParams) => Promise<any>;

interface IConfig {
    package: {
        version: string,
        name: string,
    },
    environment: string,
    sentry: {
        dsn: string,
        enabled: boolean,
        level: string
    }
}

export const setupAction: ({config}: { config: IConfig }) => void;

declare const action: (actionFn: ActionFn) =>
    (req: Request, res: Response, next: NextFunction) =>
        void | Promise<void>;
