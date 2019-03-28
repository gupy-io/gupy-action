const sinon = require('sinon');
const {expect} = require('chai');
const {action, setupAction} = require('./index');

let fakeNext;

describe('index.js', () => {
    describe('action', () => {
        beforeEach(() => {
            fakeNext = err => console.log(err);
        });
        it('should return 500 in case of error', async () => {
            // setup
            fakeNext = sinon.fake();
            const error = new Error('any error');

            // exercise
            await action(async () => {
                throw error;
            })({}, {}, fakeNext);

            // verify
            expect(fakeNext.lastArg).to.be.equal(error);
        });
        it('should return 400 validation error', async () => {
            // setup
            const fakeJson = sinon.fake();
            const fakeRes = {
                status: sinon.fake.returns({json: fakeJson})
            };
            const fakeValidationErrors = [{id: 'error1'}];
            const fakeReq = {_validationErrors: fakeValidationErrors};
            // exercise
            await action(async () => {
            })(fakeReq, fakeRes, fakeNext);

            // verify
            expect(fakeRes.status.lastArg).to.be.equal(400);
            expect(fakeJson.lastArg).to.be.deep.equal({
                "data": fakeValidationErrors,
                "message": "Bad Request"
            });
        });

        it('should return 404 if return is null', async () => {
            // setup
            const fakeJson = sinon.fake();
            const fakeRes = {
                status: sinon.fake.returns({json: fakeJson})
            };
            const fakeReq = {};
            // exercise
            await action(async () => {
                return null
            })(fakeReq, fakeRes, fakeNext);

            // verify
            expect(fakeRes.status.lastArg).to.be.equal(404);
            expect(fakeJson.lastArg).to.be.deep.equal({
                "message": "Not found"
            });
        });

        it('should return 200 if data is valid', async () => {
            // setup
            const fakeJson = sinon.fake();
            const fakeRes = {
                status: sinon.fake.returns({json: fakeJson})
            };
            const fakeReq = {};
            // exercise
            await action(async () => {
                return {id: 1, name: 'bulbasaur'}
            })(fakeReq, fakeRes, fakeNext);

            // verify
            expect(fakeRes.status.lastArg).to.be.equal(200);
            expect(fakeJson.lastArg).to.be.deep.equal({
                id: 1,
                name: "bulbasaur",
            });
        });

    });

    describe('setupAction', () => {
        beforeEach(() => {
            fakeNext = err => console.log(err);
        });
        it('it should enable newrelic', async () => {
            setupAction({
                config: {
                    package: {},
                    newrelic: {enabled: true},
                }
            });
            let localNewrelic = null;
            await action(async ({newrelic}) => {
                localNewrelic = newrelic;
            })({route: '/xpto'}, {}, ()=>{});
            expect(localNewrelic).to.exist;
        });
        it('it should enable raven', async () => {
            setupAction({
                config: {
                    package: {},
                    sentry: {enabled: true},
                }
            });
            let localRaven = null;
            await action(async ({raven}) => {
                localRaven = raven;
            })({}, {}, ()=>{});
            expect(localRaven).to.exist;
        });
    });
});
