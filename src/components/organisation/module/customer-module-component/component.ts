import { AbstractMarkoComponent, ContextService, InitComponent } from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { KIXObjectType, ContextDescriptor, ContextType, ContextMode } from '../../../../core/model';
import { OrganisationContext } from '../../../../core/browser/organisation';

class Component extends AbstractMarkoComponent implements InitComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async init(): Promise<void> {
        const organisationListContext = new ContextDescriptor(
            OrganisationContext.CONTEXT_ID, [KIXObjectType.ORGANISATION], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'organisations', ['organisations', 'contacts'], OrganisationContext
        );
        ContextService.getInstance().registerContext(organisationListContext);
    }

}

module.exports = Component;
