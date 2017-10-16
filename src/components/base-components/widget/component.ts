import { WidgetConfiguration } from '@kix/core/dist/model/client';

class WidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }
}

module.exports = WidgetComponent;
