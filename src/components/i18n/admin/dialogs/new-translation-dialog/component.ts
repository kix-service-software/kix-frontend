import { KIXObjectType, ContextMode, TranslationPatternProperty } from '../../../../../core/model';
import { ComponentState } from './ComponentState';
import { RoutingConfiguration } from '../../../../../core/browser/router';
import { TranslationDetailsContext } from '../../../../../core/browser/i18n/admin/context';
import { AbstractNewDialog } from '../../../../../core/browser/components/dialog';

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Translation',
            'Translatable#Translation successfully created.',
            KIXObjectType.TRANSLATION_PATTERN,
            new RoutingConfiguration(
                TranslationDetailsContext.CONTEXT_ID, KIXObjectType.TRANSLATION_PATTERN,
                ContextMode.DETAILS, TranslationPatternProperty.ID, true
            )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();
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
