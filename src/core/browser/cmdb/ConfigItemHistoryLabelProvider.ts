import {
    ConfigItemHistory, DateTimeUtil, ObjectIcon, KIXObjectType,
    ConfigItemHistoryProperty, User
} from '../../model';
import { TranslationService } from '../i18n/TranslationService';
import { KIXObjectService } from '../kix';
import { LabelProvider } from '../LabelProvider';

export class ConfigItemHistoryLabelProvider extends LabelProvider<ConfigItemHistory> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_HISTORY;

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ConfigItemHistoryProperty.HISTORY_TYPE:
                displayValue = 'Translatable#Action';
                break;
            case ConfigItemHistoryProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case ConfigItemHistoryProperty.CREATE_BY:
                displayValue = 'Translatable#Benutzer';
                break;
            case ConfigItemHistoryProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case ConfigItemHistoryProperty.VERSION_ID:
                displayValue = 'Translatable#to version';
                break;
            default:
                displayValue = property;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getDisplayText(
        historyEntry: ConfigItemHistory, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = historyEntry[property];

        switch (property) {
            case ConfigItemHistoryProperty.CREATE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [displayValue], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : displayValue;
                break;
            case ConfigItemHistoryProperty.CREATE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case ConfigItemHistoryProperty.VERSION_ID:
                displayValue = historyEntry.VersionID
                    ? await TranslationService.translate('Translatable#to Version')
                    : '';
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = plural ? 'Translatable#Config Item History' : 'Translatable#Config Item History';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue, []);
        }
        return displayValue;
    }

    public async getIcons(object: ConfigItemHistory, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        if (property === ConfigItemHistoryProperty.VERSION_ID && object.VersionID) {
            icons.push('kix-icon-open-right');
        }
        return icons;
    }
}
