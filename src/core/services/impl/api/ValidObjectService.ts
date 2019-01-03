import { ValidObjectResponse, ValidObjectsResponse } from '../../../api';
import { ValidObject, SortOrder, KIXObjectType } from '../../../model';
import { KIXObjectService } from './KIXObjectService';

export class ValidObjectService extends KIXObjectService {

    private static INSTANCE: ValidObjectService;

    public static getInstance(): ValidObjectService {
        if (!ValidObjectService.INSTANCE) {
            ValidObjectService.INSTANCE = new ValidObjectService();
        }
        return ValidObjectService.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected RESOURCE_URI: string = "valid";

    public kixObjectType: KIXObjectType = KIXObjectType.VALID_OBJECT;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.VALID_OBJECT;
    }

    public async getValidObjects(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<ValidObject[]> {
        const response = await this.getObjects<ValidObjectsResponse>(
            token, limit, order, changedAfter, query
        );

        return response.Valid.map((v) => new ValidObject(v));
    }

    public async getValidObject(token: string, validObjectId: number, query?: any): Promise<ValidObject> {
        const response = await this.getObject<ValidObjectResponse>(
            token, validObjectId
        );

        return new ValidObject(response.Valid);
    }

    public createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>
    ): Promise<string | number> {
        throw new Error("Method not implemented.");
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error("Method not implemented.");
    }

}
