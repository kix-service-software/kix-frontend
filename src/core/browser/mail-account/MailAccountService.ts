import { KIXObjectService } from "../kix";
import { MailAccount, KIXObjectType } from "../../model";

export class MailAccountService extends KIXObjectService<MailAccount> {

    private static INSTANCE: MailAccountService = null;

    public static getInstance(): MailAccountService {
        if (!MailAccountService.INSTANCE) {
            MailAccountService.INSTANCE = new MailAccountService();
        }

        return MailAccountService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.MAIL_ACCOUNT;
    }

    public getLinkObjectName(): string {
        return 'MailAccount';
    }

}
