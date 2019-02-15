import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, ContextService } from '../../../../core/browser';
import { KIXObjectType, ContextMode } from '../../../../core/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public labelClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        ContextService.getInstance().setDialogContext(null, KIXObjectType.TICKET, ContextMode.CREATE, null, true);
    }

}

module.exports = Component;
