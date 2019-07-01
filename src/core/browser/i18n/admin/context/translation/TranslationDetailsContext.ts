import {
    Context, BreadcrumbInformation, KIXObject,
    KIXObjectType, TranslationPattern, KIXObjectLoadingOptions, TranslationPatternProperty
} from "../../../../../model";
import { AdminContext } from "../../../../admin";
import { LabelService } from "../../../../LabelService";
import { TranslationService } from "../../../TranslationService";
import { EventService } from "../../../../event";
import { ApplicationEvent } from "../../../../application";

export class TranslationDetailsContext extends Context {

    public static CONTEXT_ID = 'i18n-translation-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<TranslationPattern>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#Translation:');
        const state = await this.getObject<TranslationPattern>();
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${state.Value}`);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.TRANSLATION_PATTERN,
        reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadTranslation() as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(
                    Number(this.objectId), object, KIXObjectType.TRANSLATION_PATTERN, changedProperties
                )
            );
        }

        return object;
    }

    private async loadTranslation(): Promise<TranslationPattern> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, [TranslationPatternProperty.LANGUAGES]
        );

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Translatable#Load Translation ...`
            });
        }, 500);

        const translationPatterns = await TranslationService.getInstance().loadObjects<TranslationPattern>(
            KIXObjectType.TRANSLATION_PATTERN, [this.objectId], loadingOptions
        );

        window.clearTimeout(timeout);

        const translationPattern = translationPatterns && translationPatterns.length ? translationPatterns[0] : null;

        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: false, hint: '' }
        );
        return translationPattern;
    }

}
