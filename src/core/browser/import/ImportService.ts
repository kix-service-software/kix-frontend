import { ImportManager } from "./ImportManager";
import { KIXObjectType } from "../../model";

export class ImportService {

    private static INSTANCE: ImportService;

    public static getInstance(): ImportService {
        if (!ImportService.INSTANCE) {
            ImportService.INSTANCE = new ImportService();
        }
        return ImportService.INSTANCE;
    }

    private constructor() { }

    private importManager: ImportManager[] = [];

    public registerImportManager(importManager: ImportManager): void {
        this.importManager.push(importManager);
    }

    public getImportManager(objectType: KIXObjectType): ImportManager {
        return this.importManager.find((bm) => bm.objectType === objectType);
    }

    public initImportManager(objectType: KIXObjectType): void {
        const importManager = this.importManager.find((bm) => bm.objectType === objectType);
        if (importManager) {
            importManager.init();
        }
    }

    public hasImportManager(objectType: KIXObjectType): boolean {
        return this.getImportManager(objectType) !== undefined;
    }

}
