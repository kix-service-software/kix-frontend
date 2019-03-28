import { KIXObjectType, ContextMode, TranslationProperty } from '../../../../../core/model';
import { ComponentState } from './ComponentState';
import { RoutingConfiguration } from '../../../../../core/browser/router';
import { TranslationDetailsContext } from '../../../../../core/browser/i18n/admin/context';
import { AbstractNewDialog } from '../../../../../core/browser/components/dialog';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Translation',
            'Translatable#Translation successfully created.',
            KIXObjectType.TRANSLATION,
            new RoutingConfiguration(
                null, TranslationDetailsContext.CONTEXT_ID, KIXObjectType.TRANSLATION,
                ContextMode.DETAILS, TranslationProperty.ID, true
            )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit();
    }

}

module.exports = Component;
