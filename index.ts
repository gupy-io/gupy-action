import {Request, Response, NextFunction} from "express";
import {validationResult} from "express-validator/check";

export interface IActionParams {
    req: Request,
        res: Response,
        next: NextFunction,
}

type ActionFn = (actionParams: IActionParams) => Promise<any>;

export const action = (actionFn: ActionFn) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        return actionFn({req, res, next})
            .then((obj: any) => {
                if (obj === null) {
                    res.status(404).send('Not found');
                } else {
                    res.json(obj);
                }
            })
            .catch((err) => {
                next(err);
            });
    };
};
