import { ObjectFactory } from "./ObjectFactory";
import { MailFilter, KIXObjectType } from "../../model";

export class MailFilterFactory extends ObjectFactory<MailFilter> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.MAIL_FILTER;
    }

    public create(mailFilter?: MailFilter): MailFilter {
        return new MailFilter(mailFilter);
    }

}
