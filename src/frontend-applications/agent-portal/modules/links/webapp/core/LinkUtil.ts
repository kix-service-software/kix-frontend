/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { LinkObject } from '../../model/LinkObject';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { LinkType } from '../../model/LinkType';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { Link } from '../../model/Link';
import { CreateLinkDescription } from '../../server/api/CreateLinkDescription';
import { LinkTypeDescription } from '../../model/LinkTypeDescription';

export class LinkUtil {

    public static async getLinkObjects(mainObject: KIXObject): Promise<LinkObject[]> {
        const links = mainObject && mainObject.Links ? mainObject.Links : [];

        const linkTypes = await KIXObjectService.loadObjects<LinkType>(
            KIXObjectType.LINK_TYPE, null, null, null, false
        );

        return links.map((l) => {
            const linkObject: LinkObject = new LinkObject();
            const linkType = linkTypes.find((lt) => lt.Name === l.Type);
            if (
                l.SourceObject === mainObject.KIXObjectType &&
                l.SourceKey.toString() === mainObject.ObjectId.toString()
            ) {
                linkObject.ObjectId = l.ObjectId || l.ID;
                linkObject.linkedObjectKey = l.TargetKey.toString();
                linkObject.linkedObjectType = l.TargetObject as KIXObjectType;
                linkObject.linkedAs = linkType.TargetName;
                linkObject.linkType = linkType;
            } else {
                linkObject.ObjectId = l.ObjectId || l.ID;
                linkObject.linkedObjectKey = l.SourceKey.toString();
                linkObject.linkedObjectType = l.SourceObject as KIXObjectType;
                linkObject.linkedAs = linkType.SourceName;
                linkObject.linkType = linkType;
                linkObject.isSource = true;
            }
            return linkObject;
        });
    }

    public static isLinkType(linkType: LinkType, link: Link, linkObject: LinkObject, mainObject: KIXObject): boolean {
        let isLinkType = false;
        if (linkType.Pointed) {
            if (linkObject.isSource) {
                isLinkType = linkType.Name === link.Type
                    && linkType.Source === linkObject.linkedObjectType
                    && linkType.Target === mainObject.KIXObjectType;
            } else {
                isLinkType = linkType.Name === link.Type
                    && linkType.Source === mainObject.KIXObjectType
                    && linkType.Target === linkObject.linkedObjectType;
            }
        } else {
            isLinkType = linkType.Name === link.Type
                && linkType.Source === linkObject.linkedObjectType
                && linkType.Target === mainObject.KIXObjectType;

            if (!isLinkType) {
                isLinkType = linkType.Name === link.Type
                    && linkType.Source === mainObject.KIXObjectType
                    && linkType.Target === linkObject.linkedObjectType;
            }
        }

        return isLinkType;
    }

    public static async getLinkDescriptions(
        rootObject: KIXObject, links?: Link[], linkedObjects?: KIXObject[]
    ): Promise<CreateLinkDescription[]> {
        if (!links) {
            links = rootObject.Links;
        }
        const linkDescriptions: CreateLinkDescription[] = [];
        if (links && links.length) {

            if (!linkedObjects) {
                linkedObjects = await this.getLinkedKIXObjects(rootObject, links);
            }

            const linkTypes = await KIXObjectService.loadObjects<LinkType>(
                KIXObjectType.LINK_TYPE, null, null, null, false
            );

            for (const link of links) {
                const rootIsSource = LinkUtil.rootIsSource(link, rootObject);
                const linkedKey = rootIsSource ? link.TargetKey : link.SourceKey;
                const linkedObjectType = rootIsSource
                    ? link.TargetObject as KIXObjectType
                    : link.SourceObject as KIXObjectType;

                const linkedObject = linkedObjects.find(
                    (lo) => lo.ObjectId.toString() === linkedKey.toString() && lo.KIXObjectType === linkedObjectType
                );

                if (linkedObject) {
                    const linkType = linkTypes.find((lt) => {
                        return lt.Name === link.Type
                            && (
                                (lt.Source === rootObject.KIXObjectType && lt.Target === linkedObjectType)
                                || (lt.Source === linkedObjectType && lt.Target === rootObject.KIXObjectType)
                            );
                    });

                    const newLinkedObject = new LinkObject(linkedObject as LinkObject);
                    newLinkedObject.LinkTypeName = link.Type;

                    if (linkType) {
                        linkDescriptions.push(
                            new CreateLinkDescription(newLinkedObject, new LinkTypeDescription(linkType, !rootIsSource))
                        );
                    }
                }
            }
        }
        return linkDescriptions;
    }

    public static getLinkedObjectIds(
        rootObject: KIXObject, links: Link[] = []
    ): Map<KIXObjectType, any[]> {
        if (links.length === 0) {
            links = rootObject.Links;
        }
        const linkedObjectIds: Map<KIXObjectType, any[]> = new Map();
        links.forEach((l) => {
            const rootIsSource = LinkUtil.rootIsSource(l, rootObject);
            const linkedKey = rootIsSource ? l.TargetKey : l.SourceKey;
            const linkedObjectType = rootIsSource ? l.TargetObject as KIXObjectType : l.SourceObject as KIXObjectType;
            if (linkedObjectIds.has(linkedObjectType)) {
                if (!linkedObjectIds.get(linkedObjectType).some((key) => key === linkedKey)) {
                    linkedObjectIds.get(linkedObjectType).push(linkedKey);
                }
            } else {
                linkedObjectIds.set(linkedObjectType, [linkedKey]);
            }
        });
        return linkedObjectIds;
    }

    public static async getLinkedKIXObjects(rootObject: KIXObject, links: Link[] = []): Promise<KIXObject[]> {
        const linkedObjectIds: Map<KIXObjectType, any[]> = this.getLinkedObjectIds(rootObject, links);

        let linkedObjects: KIXObject[] = [];
        const iterator = linkedObjectIds.entries();
        let objectIds = iterator.next();
        while (objectIds && objectIds.value) {
            if (objectIds.value[1].length) {
                const objects = await KIXObjectService.loadObjects(
                    objectIds.value[0], objectIds.value[1], null, null, false
                );
                linkedObjects = [...linkedObjects, ...objects];
            }

            objectIds = iterator.next();
        }
        return linkedObjects;
    }

    private static rootIsSource(link: Link, rootObject: KIXObject): boolean {
        return link.SourceObject === rootObject.KIXObjectType
            && link.SourceKey.toString() === rootObject.ObjectId.toString();
    }

}
