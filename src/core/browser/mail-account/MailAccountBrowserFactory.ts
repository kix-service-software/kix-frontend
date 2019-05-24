import { MailAccount } from "../../model";
import { KIXObjectFactory } from "../kix/KIXObjectFactory";

export class MailAccountBrowserFactory extends KIXObjectFactory<MailAccount> {

    private static INSTANCE: MailAccountBrowserFactory;

    public static getInstance(): MailAccountBrowserFactory {
        if (!MailAccountBrowserFactory.INSTANCE) {
            MailAccountBrowserFactory.INSTANCE = new MailAccountBrowserFactory();
        }
        return MailAccountBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(mailAccount: MailAccount): Promise<MailAccount> {
        const newMailAccount = new MailAccount(mailAccount);
        return newMailAccount;
    }

}
