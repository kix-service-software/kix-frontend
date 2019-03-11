import { ObjectData } from "../model";

export class ObjectDataService {

    private static INSTANCE: ObjectDataService;

    public static getInstance(): ObjectDataService {
        if (!ObjectDataService.INSTANCE) {
            ObjectDataService.INSTANCE = new ObjectDataService();
        }
        return ObjectDataService.INSTANCE;
    }

    private objectData: ObjectData;

    private constructor() { }

    public setObjectData(objectData: ObjectData): void {
        this.objectData = objectData;
    }

    public getObjectData(): ObjectData {
        return this.objectData;
    }

}
