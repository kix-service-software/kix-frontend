import { KIXObjectService } from "../../kix";
import {
    TicketState, KIXObjectType, KIXObject, KIXObjectLoadingOptions,
    KIXObjectSpecificLoadingOptions, KIXObjectCache, TicketStateProperty, TicketStateType
} from "../../../model";

export class TicketStateService extends KIXObjectService<TicketState> {

    private static INSTANCE: TicketStateService = null;

    public static getInstance(): TicketStateService {
        if (!TicketStateService.INSTANCE) {
            TicketStateService.INSTANCE = new TicketStateService();
        }

        return TicketStateService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TICKET_STATE
            || kixObjectType === KIXObjectType.TICKET_STATE_TYPE;
    }

    public getLinkObjectName(): string {
        return 'TicketState';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true
    ): Promise<O[]> {

        if (objectType === KIXObjectType.TICKET_STATE
            || objectType === KIXObjectType.TICKET_STATE_TYPE
        ) {
            if (!KIXObjectCache.hasObjectCache(objectType)) {
                const objects = await super.loadObjects(objectType, null, null, null, false);
                objects.forEach((s) => KIXObjectCache.addObject(objectType, s));
            }

            if (!objectIds) {
                return KIXObjectCache.getObjectCache(objectType);
            }
        }

        return await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions, cache);
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        if (property === TicketStateProperty.TYPE_ID && value instanceof TicketStateType) {
            parameter.push([property, (value as TicketStateType).ObjectId]);
        } else {
            parameter.push([property, value]);
        }

        return parameter;
    }


}
