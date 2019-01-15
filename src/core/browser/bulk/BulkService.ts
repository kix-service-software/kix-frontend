import { BulkManager } from "./BulkManager";
import { KIXObjectType, KIXObject } from "../../model";

export class BulkService {

    private static INSTANCE: BulkService;

    public static getInstance(): BulkService {
        if (!BulkService.INSTANCE) {
            BulkService.INSTANCE = new BulkService();
        }
        return BulkService.INSTANCE;
    }

    private constructor() { }

    private bulkManager: BulkManager[] = [];

    public registerBulkManager(bulkmanager: BulkManager): void {
        this.bulkManager.push(bulkmanager);
    }

    public getBulkManager(objectType: KIXObjectType): BulkManager {
        return this.bulkManager.find((bm) => bm.objectType === objectType);
    }

    public initBulkManager(objectType: KIXObjectType, objects: KIXObject[]): void {
        const bulkManager = this.bulkManager.find((bm) => bm.objectType === objectType);
        if (bulkManager) {
            bulkManager.objects = objects;
            bulkManager.reset();
        }
    }

}
