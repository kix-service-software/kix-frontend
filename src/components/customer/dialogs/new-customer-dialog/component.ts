import { ComponentState } from './ComponentState';
import { KIXObjectType, ContextMode, CustomerProperty } from '../../../../core/model';
import { CustomerDetailsContext } from '../../../../core/browser/customer';
import { RoutingConfiguration } from '../../../../core/browser/router';
import { AbstractNewDialog } from '../../../../core/browser/components/dialog';

class NewCustomerDialogComponent extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Customer',
            'Translatable#Customer successfully created.',
            KIXObjectType.CUSTOMER,
            new RoutingConfiguration(
                null, CustomerDetailsContext.CONTEXT_ID, KIXObjectType.CUSTOMER,
                ContextMode.DETAILS, CustomerProperty.CUSTOMER_ID, true
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

module.exports = NewCustomerDialogComponent;
