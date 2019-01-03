import { ServicesResponse } from "../../../api";
import { Service, KIXObjectType } from '../../../model';
import { KIXObjectService } from './KIXObjectService';

export class ServiceService extends KIXObjectService {

    private static INSTANCE: ServiceService;

    public static getInstance(): ServiceService {
        if (!ServiceService.INSTANCE) {
            ServiceService.INSTANCE = new ServiceService();
        }
        return ServiceService.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected RESOURCE_URI: string = "services";

    public kixObjectType: KIXObjectType = KIXObjectType.SERVICE;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.SERVICE;
    }

    public async getServices(token: string): Promise<Service[]> {
        const query = {
            fields: 'Service.ServiceID,Service.Name',
            include: 'IncidentState'
        };

        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.getObjectByUri<ServicesResponse>(token, uri, query);
        return response.Service;
    }

    public async getServiceHierarchy(token: string): Promise<Service[]> {
        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.getObjectByUri<ServicesResponse>(token, uri, {
            include: ',IncidentState,SubServices',
            expand: 'SubServices',
            filter: '{"Service": {"AND": [{"Field": "ParentID", "Operator": "EQ", "Value": null}]}}'
        });

        return response.Service;
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
