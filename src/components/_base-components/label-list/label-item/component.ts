import { AbstractMarkoComponent } from '../../../../core/browser';

class Component extends AbstractMarkoComponent {

    public removeLabel(): void {
        (this as any).emit('removeLabel');
    }
}

module.exports = Component;
