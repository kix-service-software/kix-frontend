/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { ConfigItem } from '../../cmdb/model/ConfigItem';
import { Contact } from '../../customer/model/Contact';
import { FAQArticle } from '../../faq/model/FAQArticle';
import { Organisation } from '../../customer/model/Organisation';
import { Ticket } from '../../ticket/model/Ticket';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class ElasticSearch extends KIXObject {
    public ObjectId: string | number;
    public KIXObjectType: string = KIXObjectType.ELASTIC_SEARCH;
    public Asset: ConfigItem[];
    public Contact: Contact[];
    public FAQ: FAQArticle[];
    public Organisation: Organisation[];
    public Ticket: Ticket[];
}