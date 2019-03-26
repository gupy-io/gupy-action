import {Request, Response, NextFunction} from "express";

declare interface IActionParams {
    req: Request,
    res: Response,
    next: NextFunction,
}
declare type ActionFn = (actionParams: IActionParams) => Promise <any>;

declare const action: (actionFn: ActionFn) =>
    (req: Request, res: Response, next: NextFunction) =>
        void | Promise<void>;
