import { IconBarComponentState } from './model/IconBarComponentState';

class IconBar {

    public state: IconBarComponentState;

    public onCreate(input: any): void {
        this.state = new IconBarComponentState();
    }

    public toggleConfigurationMode(): void {
        (this as any).emit('toggleConfigurationMode');
    }

}

module.exports = IconBar;
