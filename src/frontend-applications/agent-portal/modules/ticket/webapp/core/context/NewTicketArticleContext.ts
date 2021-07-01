/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { Article } from '../../../model/Article';
import { ArticleLoadingOptions } from '../../../model/ArticleLoadingOptions';

export class NewTicketArticleContext extends Context {

    public static CONTEXT_ID: string = 'new-ticket-article-dialog-context';


    public async getObject<O extends KIXObject>(
        objectType?: KIXObjectType, reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        let object: O;

        if (objectType && objectType === KIXObjectType.TICKET) {
            const referencedTicketId = this.getAdditionalInformation('REFERENCED_TICKET_ID');
            if (referencedTicketId) {
                const objects = await KIXObjectService.loadObjects<O>(
                    objectType, [referencedTicketId], new KIXObjectLoadingOptions(
                        undefined, undefined, 1, [KIXObjectProperty.DYNAMIC_FIELDS]
                    )
                ).catch(() => [] as O[]);
                object = objects && objects.length ? objects[0] : null;
            }
        } else {
            object = await super.getObject(objectType, reload, changedProperties);
        }

        return object;
    }

    public async getObjectList<T = KIXObject>(objectType: KIXObjectType | string): Promise<T[]> {
        let objects = [];
        if (objectType && objectType === KIXObjectType.ARTICLE) {
            const referencedTicketId = this.getAdditionalInformation('REFERENCED_TICKET_ID');
            const referencedArticleId = this.getAdditionalInformation('REFERENCED_ARTICLE_ID');
            if (referencedTicketId && referencedArticleId) {
                objects = await KIXObjectService.loadObjects<Article>(
                    KIXObjectType.ARTICLE, [referencedArticleId], undefined,
                    new ArticleLoadingOptions(referencedTicketId)
                ).catch(() => [] as Article[]);
            }
        } else {
            objects = await super.getObjectList<T>(objectType);
        }
        return objects;
    }
}
