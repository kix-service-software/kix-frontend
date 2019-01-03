import { KIXObjectService, ServiceRegistry, IKIXObjectService } from "../kix";
import { Link, KIXObjectType, KIXObject, LinkObject } from "../../model";

export class LinkService extends KIXObjectService<Link> {

    private static INSTANCE: LinkService = null;

    public static getInstance(): LinkService {
        if (!LinkService.INSTANCE) {
            LinkService.INSTANCE = new LinkService();
        }

        return LinkService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.LINK
            || kixObjectType === KIXObjectType.LINK_OBJECT
            || kixObjectType === KIXObjectType.LINK_TYPE;
    }

    public getLinkObjectName(): string {
        return 'LinkObject';
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        parameter.push([property, value]);
        return parameter;
    }

    public async getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string> {
        if (object && object instanceof LinkObject) {
            const service = ServiceRegistry.getInstance().getServiceInstance<IKIXObjectService>(
                object.linkedObjectType
            );
            return service ? await service.getObjectUrl(null, object.linkedObjectKey) : null;
        }
        return await super.getObjectUrl(object);
    }

}
