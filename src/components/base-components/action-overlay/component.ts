class ActionOverlayComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            showOverlay: false,
            action: input.action,
            template: null
        };
    }

    public onInput(input: any): void {
        this.state.showOverlay = input.showOverlay;
    }

    public onMount(): void {
        this.state.template = require(this.state.action.template);
    }

    public runClicked(): void {
        (this as any).emit('runAction');
    }

    public cancelClicked(): void {
        (this as any).emit('cancelAction');
    }

}

module.exports = ActionOverlayComponent;
