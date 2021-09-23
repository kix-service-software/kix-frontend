/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { Link } from '../../model/Link';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { LinkObject } from '../../model/LinkObject';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { IKIXObjectService } from '../../../../modules/base-components/webapp/core/IKIXObjectService';
import { RoutingConfiguration } from '../../../../model/configuration/RoutingConfiguration';
import { LinkObjectProperty } from '../../model/LinkObjectProperty';
import { LinkType } from '../../model/LinkType';

export class LinkService extends KIXObjectService<Link> {

    private static INSTANCE: LinkService = null;

    public static getInstance(): LinkService {
        if (!LinkService.INSTANCE) {
            LinkService.INSTANCE = new LinkService();
        }

        return LinkService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.LINK);
        this.objectConstructors.set(KIXObjectType.LINK, [Link]);
        this.objectConstructors.set(KIXObjectType.LINK_OBJECT, [LinkObject]);
        this.objectConstructors.set(KIXObjectType.LINK_TYPE, [LinkType]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.LINK
            || kixObjectType === KIXObjectType.LINK_OBJECT
            || kixObjectType === KIXObjectType.LINK_TYPE;
    }

    public getLinkObjectName(): string {
        return 'LinkObject';
    }

    public async getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string> {
        if (object && object instanceof LinkObject) {
            const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(
                object.linkedObjectType
            );
            return service ? await service.getObjectUrl(null, object.linkedObjectKey) : null;
        }
        return await super.getObjectUrl(object);
    }

    public getObjectRoutingConfiguration(object: LinkObject): RoutingConfiguration {
        let service: IKIXObjectService;
        if (object) {
            service = ServiceRegistry.getServiceInstance<IKIXObjectService>(object.linkedObjectType);
        }
        const routingConfig = service ? service.getObjectRoutingConfiguration() : null;

        if (routingConfig) {
            routingConfig.objectIdProperty = LinkObjectProperty.LINKED_OBJECT_KEY;
        }

        return routingConfig;
    }

}
