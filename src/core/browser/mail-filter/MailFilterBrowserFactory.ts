import { MailFilter } from "../../model";
import { KIXObjectFactory } from "../kix/KIXObjectFactory";

export class MailFilterBrowserFactory extends KIXObjectFactory<MailFilter> {

    private static INSTANCE: MailFilterBrowserFactory;

    public static getInstance(): MailFilterBrowserFactory {
        if (!MailFilterBrowserFactory.INSTANCE) {
            MailFilterBrowserFactory.INSTANCE = new MailFilterBrowserFactory();
        }
        return MailFilterBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(mailFilter: MailFilter): Promise<MailFilter> {
        const newMailFilter = new MailFilter(mailFilter);
        return newMailFilter;
    }

}
