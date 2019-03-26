import {validationResult} from "express-validator/check";
import * as Raven from 'raven';

const handle200 = (req, res, next, data) => {
    res.status(200).json(data);
};

const handle404 = (req, res, next) => {
    res.status(404).json({
        message: 'Not found'
    });
};

const handle400 = (req, res, next, data) => {
    res.status(400).json({
        message: 'Bad Request',
        data,
    });
};

const handle500 = (req, res, next, err) => {
    try {
        raven.captureException(err);
    } catch (sentryErr) {
        console.debug('unable to use Sentry on error: ', sentryErr);
    }
    next(err);
};

let raven;

module.exports.setupAction = ({config}) => {
    const options = {
        release: config.package.version,
        environment: config.environment,
        autoBreadcrumbs: true,
        captureUnhandledRejections: true,
        tags: {
            platform: config.package.name,
        },
    };

    if (!raven) {
        Raven.config(config.sentry.dsn, options).install();
        raven = Raven;
    }
};

module.exports.action = (actionFn) =>
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handle400(req, res, next, errors.array());
        }
        return actionFn({req, res, next})
            .then((data) => {
                if (data === null) {
                    handle404(req, res, next);
                } else {
                    handle200(req, res, next, data);
                }
            })
            .catch((err) => {
                handle500(req, res, next, err);
            });
    };

