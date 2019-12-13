/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../../../../model/Context";
import { LabelService } from "../../../../../../../modules/base-components/webapp/core/LabelService";
import { TranslationPattern } from "../../../../../model/TranslationPattern";
import { BreadcrumbInformation } from "../../../../../../../model/BreadcrumbInformation";
import { TranslationService } from "../../../TranslationService";
import { AdminContext } from "../../../../../../admin/webapp/core";
import { KIXObject } from "../../../../../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../../../../../model/kix/KIXObjectType";
import { KIXObjectLoadingOptions } from "../../../../../../../model/KIXObjectLoadingOptions";
import { TranslationPatternProperty } from "../../../../../model/TranslationPatternProperty";
import { EventService } from "../../../../../../../modules/base-components/webapp/core/EventService";
import { ApplicationEvent } from "../../../../../../../modules/base-components/webapp/core/ApplicationEvent";

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
                loading: true, hint: 'Translatable#Load Translation'
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
