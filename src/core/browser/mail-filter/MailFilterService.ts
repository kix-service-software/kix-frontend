import { KIXObjectService } from "../kix";
import { MailFilter, KIXObjectType, MailFilterProperty, MailFilterMatch } from "../../model";

export class MailFilterService extends KIXObjectService<MailFilter> {

    private static INSTANCE: MailFilterService = null;

    public static getInstance(): MailFilterService {
        if (!MailFilterService.INSTANCE) {
            MailFilterService.INSTANCE = new MailFilterService();
        }

        return MailFilterService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.MAIL_FILTER;
    }

    public getLinkObjectName(): string {
        return 'MailFilter';
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        switch (property) {
            case MailFilterProperty.STOP_AFTER_MATCH:
                value = Number(value);
                break;
            case MailFilterProperty.MATCH:
                if (Array.isArray(value)) {
                    (value as MailFilterMatch[]).forEach((m) => {
                        m.Not = Number(m.Not);
                    });
                }
                break;
            default:
        }
        return [[property, value]];
    }

}
