import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, ContextService } from '../../../../core/browser';
import { EventService } from '../../../../core/browser/event';
import { TicketEvent, ContextType, KIXObjectType } from '../../../../core/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.cell = input.cell;
        if (this.state.cell) {
            const value = this.state.cell.getValue().objectValue;
            this.state.isActive = value !== undefined && value !== null && value !== 0;
        }
    }

    public goToArticleClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        if (context) {
            context.provideScrollInformation(KIXObjectType.ARTICLE, this.state.cell.getValue().objectValue);
        }
    }

}

module.exports = Component;
