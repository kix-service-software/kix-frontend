import { IObjectFactory } from "../IObjectFactory";
import { MailAccount } from "./MailAccount";
import { KIXObjectType } from "../KIXObjectType";

export class MailAccountFactory implements IObjectFactory<MailAccount> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.MAIL_ACCOUNT;
    }

    public create(mailAccount?: MailAccount): MailAccount {
        return new MailAccount(mailAccount);
    }

}
