import { IconBarComponentState } from './model/IconBarComponentState';

class IconBar {

    public state: IconBarComponentState;

    public onCreate(input: any): void {
        this.state = new IconBarComponentState();
    }

    public toggleConfigurationOverlay(): void {
        this.state.showConfigurationOverlay = !this.state.showConfigurationOverlay;
        (this as any).emit('toggleConfigurationOverlay');
    }

}

module.exports = IconBar;
