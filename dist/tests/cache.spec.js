"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importStar(require("../index"));
const assert = require("assert");
describe('cache', function () {
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield index_1.default.unbindMissHandler('name');
            yield index_1.default.unbindMissHandler('job');
            yield index_1.default.unbindMissHandler('spots');
            yield index_1.default.unbindMissHandler('stairs');
        });
    });
    context('Cache', function () {
        it('should save and load a value', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield index_1.default.bindMissHandler('name', 15000, function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        return 'sam';
                    });
                });
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    let name = yield index_1.default.get('name');
                    assert.strictEqual(name, 'sam');
                }));
            });
        });
        it('should get and concat an array of arrays', function () {
            return __awaiter(this, void 0, void 0, function* () {
                function getData(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        switch (key) {
                            case 'spots':
                                return ['ledge gap', 'Bank'];
                            case 'stairs':
                                return ['5 stair', '12 stair'];
                        }
                        return [''];
                    });
                }
                yield index_1.default.bindMissHandler('spots', 15000, getData);
                yield index_1.default.bindMissHandler('stairs', 15000, getData);
                setTimeout(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        let allSpots = yield index_1.default.getConcat(['spots', 'stairs']);
                        assert.deepStrictEqual(allSpots, ['ledge gap', 'Bank', '5 stair', '12 stair']);
                    });
                }, 500);
            });
        });
        it('shouldnt get and concat an array with a string', function () {
            return __awaiter(this, void 0, void 0, function* () {
                function getData(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        switch (key) {
                            case 'spots':
                                return 'ledge gap';
                            case 'stairs':
                                return ['5 stair', '12 stair'];
                        }
                        return [''];
                    });
                }
                yield index_1.default.bindMissHandler('spots', 15000, getData);
                yield index_1.default.bindMissHandler('stairs', 15000, getData);
                setTimeout(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        assert.throws(yield index_1.default.getConcat(['spots', 'stairs']));
                    });
                }, 500);
            });
        });
        it('should use a generic miss handler', function () {
            return __awaiter(this, void 0, void 0, function* () {
                function getData(key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        switch (key) {
                            case 'name':
                                return 'sam';
                            case 'job':
                                return 'driver';
                        }
                        return '';
                    });
                }
                yield index_1.default.bindMissHandler('name', 15000, getData);
                yield index_1.default.bindMissHandler('job', 15000, getData);
                setTimeout(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        let name = yield index_1.default.get('name');
                        let job = yield index_1.default.get('job');
                        assert.strictEqual(name, 'sam');
                        assert.strictEqual(job, 'driver');
                    });
                }, 200);
            });
        });
        it('should delete the data after it expires', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let lastSaved = 0;
                yield index_1.default.bindMissHandler('name', 2000, function (key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        lastSaved = Date.now();
                        return 'sam';
                    });
                });
                let lastSaved0 = lastSaved;
                yield index_1.default.get('name');
                let lastSaved1 = Date.now();
                assert.strictEqual((lastSaved1 - lastSaved0) > 2000, true);
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    let lastSavedCache = lastSaved;
                    yield index_1.default.get('name');
                    assert.strictEqual((lastSaved - lastSavedCache) > 2000, true);
                }), 3000);
            });
        });
        it('should allow for manual misses', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let name = 'sam';
                yield index_1.default.bindMissHandler('name', 15000, function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        return name;
                    });
                });
                assert.strictEqual(yield index_1.default.get('name'), 'sam');
                name = 'joe';
                yield index_1.default.miss('name');
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    assert.strictEqual(yield index_1.default.get('name'), 'joe');
                }), 2000);
            });
        });
        it('should unbind miss handlers', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield index_1.default.bindMissHandler('name', 200, function (key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return 'sam';
                    });
                });
                yield index_1.default.unbindMissHandler('name');
                yield index_1.default.bindMissHandler('name', 2000, function (key) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return 'john';
                    });
                });
                yield index_1.default.miss('name');
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    assert.strictEqual(yield index_1.default.get('name'), 'john');
                }), 1500);
            });
        });
    });
    context('SectionCache', function () {
        it('should save and load a value in a section generically', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield index_1.SectionedCache.bindMissHandler('users', 15000, function (userKey) {
                    return __awaiter(this, void 0, void 0, function* () {
                        switch (userKey) {
                            case 1:
                                return 'user id 1';
                            case '2':
                                return 'user id 1';
                        }
                        return [''];
                    });
                });
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    let user0 = yield index_1.SectionedCache.get('users', 1);
                    assert.strictEqual(user0, 'user id 1');
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        let user1 = yield index_1.SectionedCache.get('users', 2);
                        assert.strictEqual(user1, 'user id 2');
                    }));
                }), 300);
            });
        });
    });
});
