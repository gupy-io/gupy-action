const {validationResult} = require("express-validator/check");
const Raven = require('raven');

let newrelic;

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
        if (raven) raven.captureException(err);
    } catch (sentryErr) {
        console.debug('Unable to use Sentry on error: ', err, sentryErr);
    }
    if (newrelicConfig.enabled) newrelic.noticeError(err);
    next(err);
};

let raven;
let newrelicConfig = {};

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

    if (!raven && config.sentry && config.sentry.enabled) {
        Raven.config(config.sentry.dsn, options).install();
        raven = Raven;
    }
    if (!newrelic && config.newrelic && config.newrelic.enabled) {
        newrelicConfig = config.newrelic;
        newrelic = require('newrelic');
    }
};

module.exports.action = (actionFn) =>
    (req, res, next) => {
        if (newrelicConfig && newrelicConfig.enabled && req.route) {
            newrelic.setControllerName(req.route);
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handle400(req, res, next, errors.array());
        }
        return actionFn({req, res, next, raven, newrelic})
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

