import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { BrowserUtil } from '../../core/BrowserUtil';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private updateTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.prepareContent(input.html);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    private prepareContent(html: string): void {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = setTimeout(() => {
            const iframe: any = document.getElementById(`${this.state.frameId}`);
            if (iframe) {
                iframe.srcdoc = BrowserUtil.buildHtmlStructur(html);
            }
        }, 150);
    }

}

module.exports = Component;