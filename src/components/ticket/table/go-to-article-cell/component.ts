import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../core/browser';
import { EventService } from '../../../../core/browser/event';
import { TicketEvent } from '../../../../core/model';

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
        EventService.getInstance().publish(
            TicketEvent.SCROLL_TO_ARTICLE, this.state.cell.getValue().objectValue
        );
    }

}

module.exports = Component;
