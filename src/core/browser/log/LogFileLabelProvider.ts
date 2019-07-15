import { LabelProvider } from "../LabelProvider";
import { KIXObjectType, DateTimeUtil } from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { LogFile, LogFileProperty } from "../../model/kix/log";

export class LogFileLabelProvider extends LabelProvider {

    public isLabelProviderFor(logFile: LogFile): boolean {
        return logFile instanceof LogFile;
    }

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.LOG_FILE;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case LogFileProperty.DISPLAY_NAME:
                displayValue = 'Translatable#Title';
                break;
            case LogFileProperty.FILE_SIZE:
                displayValue = 'Translatable#Size';
                break;
            case LogFileProperty.MODIFIY_TIME:
                displayValue = 'Translatable#Modification Time';
                break;
            default:
                displayValue = await super.getPropertyText(property, false, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case LogFileProperty.MODIFIY_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

}
