import {
    Context, Role, BreadcrumbInformation, KIXObject, KIXObjectType, KIXObjectLoadingOptions, RoleProperty
} from "../../../../model";
import { LabelService } from "../../../LabelService";
import { AdminContext } from "../../../admin";
import { EventService } from "../../../event";
import { ApplicationEvent } from "../../../application";
import { KIXObjectService } from "../../../kix";
import { TranslationService } from "../../../i18n/TranslationService";


export class RoleDetailsContext extends Context {

    public static CONTEXT_ID = 'user-role-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<Role>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#Role');
        const object = await this.getObject<Role>();
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${object.Name}`);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.ROLE, reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadRole(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, KIXObjectType.ROLE, changedProperties)
            );
        }

        return object;
    }

    private async loadRole(changedProperties: string[] = [], cache: boolean = true): Promise<Role> {
        const roleId = Number(this.objectId);

        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, null, null,
            [RoleProperty.USER_IDS, RoleProperty.PERMISSIONS, RoleProperty.CONFIGURED_PERMISSIONS]
        );

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Translatable#Load Role ...`
            });
        }, 500);

        const roles = await KIXObjectService.loadObjects<Role>(
            KIXObjectType.ROLE, [roleId], loadingOptions, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let role: Role;
        if (roles && roles.length) {
            role = roles[0];
            this.objectId = role.ID;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return role;
    }

}
