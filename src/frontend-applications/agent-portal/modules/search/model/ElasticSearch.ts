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