import {
    Context, User, BreadcrumbInformation, KIXObjectType, KIXObject, KIXObjectLoadingOptions, UserProperty
} from "../../../../../model";
import { LabelService } from "../../../../LabelService";
import { AdminContext } from "../../../../admin";
import { EventService } from "../../../../event";
import { ApplicationEvent } from "../../../../application";
import { KIXObjectService } from "../../../../kix";
import { TranslationService } from "../../../../i18n/TranslationService";

export class UserDetailsContext extends Context {

    public static CONTEXT_ID = 'user-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<User>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#Agent');
        const object = await this.getObject<User>();
        const text = await LabelService.getInstance().getText(object);
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${text}`);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.USER, reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        const user = await this.loadUser(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), user, KIXObjectType.USER, changedProperties)
            );
        }

        return user;
    }

    private async loadUser(changedProperties: string[] = [], cache: boolean = true): Promise<User> {
        const userId = Number(this.objectId);

        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, null, null, [UserProperty.PREFERENCES, UserProperty.ROLEIDS]
        );

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Translatable#Load User ...`
            });
        }, 500);

        const users = await KIXObjectService.loadObjects<User>(
            KIXObjectType.USER, [userId], loadingOptions, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let user: User;
        if (users && users.length) {
            user = users[0];
            this.objectId = user.UserID;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return user;
    }

}
