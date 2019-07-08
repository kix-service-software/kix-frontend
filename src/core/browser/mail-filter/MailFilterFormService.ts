import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType, MailFilter, MailFilterProperty, MailFilterMatch } from "../../model";

export class MailFilterFormService extends KIXObjectFormService<MailFilter> {

    private static INSTANCE: MailFilterFormService = null;

    public static getInstance(): MailFilterFormService {
        if (!MailFilterFormService.INSTANCE) {
            MailFilterFormService.INSTANCE = new MailFilterFormService();
        }

        return MailFilterFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.MAIL_FILTER;
    }

    protected async getValue(property: string, value: any, mailFilter: MailFilter): Promise<any> {
        switch (property) {
            case MailFilterProperty.MATCH:
                if (Array.isArray(value)) {
                    (value as MailFilterMatch[]).forEach((m) => {
                        m.Not = Boolean(m.Not);
                    });
                }
                break;
            default:
        }
        return value;
    }
}
