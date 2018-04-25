import { OverlayMessageComponentState } from "./OverlayMessageComponentState";
import { MessageOverlayService } from "@kix/core/dist/browser/application/MessageOverlayService";
import { WidgetType, MessageType } from "@kix/core/dist/model";
import { ContextService } from "@kix/core/dist/browser/context";

class ObjectInfoOverlayComponent {

    private state: OverlayMessageComponentState;

    public onCreate(input: any): void {
        this.state = new OverlayMessageComponentState();
    }

    public onMount(): void {
        MessageOverlayService.getInstance().addMessageOverlayListener(this.showMessageOverlay.bind(this));
    }

    private showMessageOverlay(title: string, message: string, type: MessageType): void {
        this.setWidgetType(type);
        this.state.title = title;
        this.state.message = message;
        this.state.show = true;
    }

    private setWidgetType(type: MessageType): void {
        const context = ContextService.getInstance().getContext();
        if (context) {
            switch (type) {
                default:
                    context.setWidgetType(this.state.instanceId, WidgetType.WARNING_OVERLAY);
            }
        }
    }

    private getIcon(): string {
        return 'kix-icon-exclamation';
    }

    private closeOverlay(): void {
        this.state.show = false;
    }

}

module.exports = ObjectInfoOverlayComponent;
