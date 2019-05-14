import { ComponentState } from './ComponentState';
import { KIXObjectType, ContextMode, OrganisationProperty } from '../../../../core/model';
import { RoutingConfiguration } from '../../../../core/browser/router';
import { AbstractNewDialog } from '../../../../core/browser/components/dialog';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { OrganisationDetailsContext } from '../../../../core/browser/organisation';

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Organisation',
            'Translatable#Organisation successfully created.',
            KIXObjectType.ORGANISATION,
            new RoutingConfiguration(
                null, OrganisationDetailsContext.CONTEXT_ID, KIXObjectType.ORGANISATION,
                ContextMode.DETAILS, OrganisationProperty.ID, true
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
