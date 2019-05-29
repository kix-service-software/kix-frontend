import { IObjectFactory } from "./IObjectFactory";
import { MailAccount, KIXObjectType } from "../../model";
import { ObjectFactory } from "./ObjectFactory";

export class MailAccountFactory extends ObjectFactory<MailAccount> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.MAIL_ACCOUNT;
    }

    public create(mailAccount?: MailAccount): MailAccount {
        return new MailAccount(mailAccount);
    }

}
