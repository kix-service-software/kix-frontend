import {
    Context, BreadcrumbInformation, KIXObject, KIXObjectType, MailFilter
} from "../../../model";
import { AdminContext } from "../../admin";
import { EventService } from "../../event";
import { KIXObjectService } from "../../kix";
import { LabelService } from "../../LabelService";
import { ApplicationEvent } from "../../application";
import { TranslationService } from "../../i18n/TranslationService";

export class MailFilterDetailsContext extends Context {

    public static CONTEXT_ID = 'mail-filter-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<MailFilter>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const categoryLabel = await TranslationService.translate('Translatable#Communication');
        const emailLabel = await TranslationService.translate('Translatable#Email');
        const mailFilter = await this.getObject<MailFilter>();
        const breadcrumbText = `${categoryLabel}: ${emailLabel}: ${mailFilter.Name}`;
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], breadcrumbText);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.MAIL_FILTER, reload: boolean = false,
        changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadFilter(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, objectType, changedProperties)
            );
        }

        return object;
    }

    private async loadFilter(changedProperties: string[] = [], cache: boolean = true): Promise<MailFilter> {
        const mailFilterId = Number(this.objectId);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Translatable#Load Email Filter ...`
            });
        }, 500);

        const mailFilters = await KIXObjectService.loadObjects<MailFilter>(
            KIXObjectType.MAIL_FILTER, [mailFilterId], null, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let mailFilter: MailFilter;
        if (mailFilters && mailFilters.length) {
            mailFilter = mailFilters[0];
            this.objectId = mailFilter.ID;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return mailFilter;
    }

}
