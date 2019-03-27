import { AbstractMarkoComponent } from '../../../../core/browser';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.isToggle = typeof input.toggle !== 'undefined' ? input.toggle : false;
    }

    public labelClicked(event: any): void {
        this.state.toggled = !this.state.toggled;
        event.stopPropagation();
        event.preventDefault();
        (this as any).emit('labelClicked');
    }

    public removeLabel(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        (this as any).emit('removeLabel');
    }
}

module.exports = Component;
