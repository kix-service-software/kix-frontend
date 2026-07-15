import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { KIXObjectServiceRegistry } from '../../services/KIXObjectServiceRegistry';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { ObjectLoader } from '../../services/ObjectLoader';
import { ObjectResponse } from '../../services/ObjectResponse';
import { KIXObjectAPIService } from '../../services/KIXObjectAPIService';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObject } from '../../../model/kix/KIXObject';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ObjectLoader', () => {

    describe('Concurrent requests for same objectType and objectId', () => {
        let promiseState1: string, promiseState2: string, promiseState3: string,
            promiseResult1: UnitTest, promiseResult2: UnitTest, promiseResult3: UnitTest,
            checkObject: UnitTest;

        before(async () => {
            const unitTestService = new UnitTestService();
            KIXObjectServiceRegistry.registerServiceInstance(unitTestService);

            checkObject = new UnitTest();
            checkObject.ObjectId = '1';

            const promise1 = ObjectLoader.getInstance().queue('UnitTest', checkObject.ObjectId)
                .then(((obj) => promiseResult1 = obj)).catch(() => null);
            const promise2 = ObjectLoader.getInstance().queue('UnitTest', checkObject.ObjectId)
                .then(((obj) => promiseResult2 = obj)).catch(() => null);
            const promise3 = ObjectLoader.getInstance().queue('UnitTest', checkObject.ObjectId)
                .then(((obj) => promiseResult3 = obj)).catch(() => null);
            const promiseTimeout = new Promise((resolve, reject) =>
                // timeout after 1 second
                setTimeout(() => reject(new Error("timed out")), 1000)
            );
            await Promise.race([promise1, promise2, promise3, promiseTimeout]);

            await promiseState(promise1).then(state => promiseState1 = state);
            await promiseState(promise2).then(state => promiseState2 = state);
            await promiseState(promise3).then(state => promiseState3 = state);
        });

        describe('First promise', () => {
            it('Promise state', () => {
                expect(promiseState1).equals('fulfilled');
            });

            it('Promise result', () => {
                expect(promiseResult1?.ObjectId).equals(checkObject.ObjectId);
            });
        });
        describe('Second promise', () => {
            it('Promise state', () => {
                expect(promiseState2).equals('fulfilled');
            });

            it('Promise result', () => {
                expect(promiseResult2?.ObjectId).equals(checkObject.ObjectId);
            });
        });
        describe('Third promise', () => {
            it('Promise state', () => {
                expect(promiseState3).equals('fulfilled');
            });

            it('Promise result', () => {
                expect(promiseResult3?.ObjectId).equals(checkObject.ObjectId);
            });
        });
    });
});

function promiseState(p) {
    const t = {};
    return Promise.race([p, t])
        .then(v => (v === t) ? "pending" : "fulfilled", () => "rejected");
}

class UnitTestService extends KIXObjectAPIService {

    private static INSTANCE: UnitTestService;

    public static getInstance(): UnitTestService {
        if (!UnitTestService.INSTANCE) {
            UnitTestService.INSTANCE = new UnitTestService();
        }
        return UnitTestService.INSTANCE;
    }

    public constructor() {
        super();
    }

    protected RESOURCE_URI: string = this.buildUri('test');

    public objectType: string = 'UnitTest';

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === this.objectType;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {
        const objects: UnitTest[] = [];

        objectIds.forEach(
            (objectId) => {
                const object = new UnitTest();
                object.ObjectId = objectId.toString();

                objects.push(object);
            }
        );

        const objectResponse = new ObjectResponse(objects, objects.length);

        return objectResponse as ObjectResponse<T>;
    }

    public getObjectClass(objectType: KIXObjectType | string): new (object: KIXObject) => KIXObject {
        return UnitTest;
    }
}

class UnitTest extends KIXObject {

    public ObjectId: string | number;
    public KIXObjectType: string = 'UnitTest';

    public constructor(unitTest?: UnitTest) {
        super();
        if (unitTest) {
            this.ObjectId = unitTest.ObjectId;
        }
    }

}