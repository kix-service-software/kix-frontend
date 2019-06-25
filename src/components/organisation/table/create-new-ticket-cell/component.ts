import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, ContextService, ICell, DialogService } from '../../../../core/browser';
import { KIXObjectType, ContextMode, Contact } from '../../../../core/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.cell) {
            const cell: ICell = input.cell;
            const contact: Contact = cell.getRow().getRowObject().getObject();
            if (contact && contact instanceof Contact) {
                const dialogs = DialogService.getInstance().getRegisteredDialogs(
                    ContextMode.CREATE, KIXObjectType.TICKET
                );
                this.state.show = contact.ValidID === 1 && dialogs && dialogs.length > 0;
            }
        }
    }

    public labelClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        ContextService.getInstance().setDialogContext(null, KIXObjectType.TICKET, ContextMode.CREATE, null, true);
    }

}

module.exports = Component;
