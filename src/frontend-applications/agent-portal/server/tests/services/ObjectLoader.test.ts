import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { KIXObjectServiceRegistry } from '../../services/KIXObjectServiceRegistry';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { ObjectLoader } from '../../services/ObjectLoader';
import { ObjectResponse } from '../../services/ObjectResponse';
import { KIXObjectAPIService } from '../../services/KIXObjectAPIService';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ObjectLoader', () => {

    describe('Concurrent requests for same objectType and objectId', () => {
        before(() => {
            const unitTestService = new UnitTestService();
            KIXObjectServiceRegistry.registerServiceInstance(unitTestService);
        });

        it('All concurrent requests are answered.', async () => {
            let promiseState1, promiseState2, promiseState3,
                promiseResult1, promiseResult2, promiseResult3;
            const promise1 = ObjectLoader.getInstance().queue('UnitTest', 1)
                .then(((obj) => promiseResult1 = obj)).catch(() => null);
            const promise2 = ObjectLoader.getInstance().queue('UnitTest', 1)
                .then(((obj) => promiseResult2 = obj)).catch(() => null);
            const promise3 = ObjectLoader.getInstance().queue('UnitTest', 1)
                .then(((obj) => promiseResult3 = obj)).catch(() => null);
            const promiseTimeout = new Promise((resolve, reject) =>
                // timeout after 1 second
                setTimeout(() => reject(new Error("timed out")), 1000)
            );
            await Promise.race([promise1, promise2, promiseTimeout]);

            await promiseState(promise1).then(state => promiseState1 = state);
            await promiseState(promise2).then(state => promiseState2 = state);
            await promiseState(promise3).then(state => promiseState3 = state);

            expect(promiseState1).equals('fulfilled');
            expect(promiseState2).equals('fulfilled');
            expect(promiseState3).equals('fulfilled');
        })
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
        return new ObjectResponse([], 1);
    }

}