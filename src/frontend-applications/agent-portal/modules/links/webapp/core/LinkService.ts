/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { LabelService } from '../../../base-components/webapp/core/LabelService';

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

    public static async getLinkTypes(
        sourceType: KIXObjectType | string, targetType: KIXObjectType | string = sourceType
    ): Promise<LinkType[]> {
        const filterType = !targetType ? FilterType.OR : FilterType.AND;
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                'Source', SearchOperator.EQUALS, FilterDataType.STRING, filterType, sourceType
            ),
            new FilterCriteria(
                'Target', SearchOperator.EQUALS, FilterDataType.STRING, filterType, targetType
            )
        ]);

        const linkTypes = await KIXObjectService.loadObjects<LinkType>(
            KIXObjectType.LINK_TYPE, null, loadingOptions, null, false
        ).catch(() => []);

        return linkTypes;
    }

    public static async getPossibleLinkPartners(
        rootType: KIXObjectType | string
    ): Promise<Array<[string, KIXObjectType]>> {
        const partners: Array<[string, KIXObjectType]> = [];
        const linkTypes = await KIXObjectService.loadObjects<LinkType>(KIXObjectType.LINK_TYPE, null, null, null, false)
            .catch(() => [] as LinkType[]);

        for (const lt of linkTypes) {
            let linkableObjectType = null;

            if (lt.Source === rootType) {
                linkableObjectType = lt.Target;
            } else if (lt.Target === rootType) {
                linkableObjectType = lt.Source;
            }

            if (linkableObjectType && !partners.some((p) => p[1] === linkableObjectType)) {
                const objectName = await LabelService.getInstance().getObjectName(linkableObjectType);

                const service = ServiceRegistry.getServiceInstance(linkableObjectType);
                if (service) {
                    if (await service.hasReadPermissionFor(linkableObjectType)) {
                        partners.push([objectName, linkableObjectType]);
                    }
                }
            }
        }

        return partners;
    }

}
