import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { BrowserUtil } from '../../core/BrowserUtil';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private updateTimeout: any;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        if (Array.isArray(input.sanboxAttributes)) {
            for (const attribute of input.sanboxAttributes) {
                if (!this.state.sandboxAttributes.some((a) => a === attribute)) {
                    this.state.sandboxAttributes.push(attribute);
                }
            }
        }

        this.prepareContent(input.html);

        this.state.calculateHeight = input.calculateHeight;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    private prepareContent(html: string): void {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = setTimeout(async () => {
            const iframe: any = document.getElementById(`${this.state.frameId}`);
            if (iframe) {
                iframe.srcdoc = await BrowserUtil.buildHtmlStructur(html);
            }
        }, 150);
    }

    public viewLoaded(event: any): void {
        if (this.state.calculateHeight) {
            BrowserUtil.setFrameHeight(this.state.frameId);
        }
    }

}

module.exports = Component;