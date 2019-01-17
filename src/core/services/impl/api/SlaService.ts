import { KIXObjectService } from "./KIXObjectService";
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions,
    Sla,
    KIXObjectCache,
    Error
} from "../../../model";
import { KIXObjectServiceRegistry } from "../../KIXObjectServiceRegistry";
import { SlasResponse } from "../../../api";
import { ConfigurationService } from "../ConfigurationService";

export class SlaService extends KIXObjectService {

    private static INSTANCE: SlaService;

    public static getInstance(): SlaService {
        if (!SlaService.INSTANCE) {
            SlaService.INSTANCE = new SlaService();
        }
        return SlaService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.getInstance().registerServiceInstance(this);
    }

    public isServiceFor(type: KIXObjectType): boolean {
        return type === KIXObjectType.SLA;
    }

    protected RESOURCE_URI: string = 'slas';

    public async initCache(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const token = serverConfig.BACKEND_API_TOKEN;
        await this.loadSLAs(token);
    }

    public async loadObjects<T>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        let objects = [];

        switch (objectType) {
            case KIXObjectType.SLA:
                objects = await this.loadSLAs(token);
                break;
            default:
        }

        return objects;
    }

    private async loadSLAs(token: string): Promise<Sla[]> {
        if (!KIXObjectCache.hasObjectCache(KIXObjectType.SLA)) {
            const uri = this.buildUri(this.RESOURCE_URI);
            const response = await this.getObjectByUri<SlasResponse>(token, uri);
            response.SLA
                .map((sla) => new Sla(sla))
                .forEach((sla) => KIXObjectCache.addObject(KIXObjectType.SLA, sla));
        }
        return KIXObjectCache.getObjectCache(KIXObjectType.SLA);
    }

    public createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }
    public updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        objectId: string | number, updateOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

}
