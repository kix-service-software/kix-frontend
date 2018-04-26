import { OverlayComponentState } from "./OverlayComponentState";
import { OverlayService } from "@kix/core/dist/browser";
import { OverlayType, IWidgetContent, ObjectIcon, ComponentContent, Context, WidgetType } from "@kix/core/dist/model";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context";
import { ComponentsService } from "@kix/core/dist/browser/components";

class OverlayComponent {

    private state: OverlayComponentState;

    public onCreate(): void {
        this.state = new OverlayComponentState();
    }

    public onMount(): void {
        OverlayService.getInstance().registerOverlayListener(this.openOverlay.bind(this));
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
    }

    public onUpdate(): void {
        if (this.state.position && this.state.position.length === 2) {
            this.setOverlayPosition();
        }
    }

    private contextNotified(contextId: string, type: ContextNotification, context: Context<any>): void {
        if (type === ContextNotification.CONTEXT_CHANGED) {
            context.setWidgetType(this.state.instanceId, WidgetType.OVERLAY);
        }
    }

    private openOverlay(
        type: OverlayType, content: IWidgetContent, title: string,
        actions: string[], closeButton: boolean, position: [number, number]
    ): void {
        this.state.title = title;
        this.state.icon = this.getWidgetIcon(type);
        this.state.actions = actions;
        this.state.content = content;
        this.state.hasCloseButton = closeButton;
        this.state.position = position;
        this.state.overlayClass = this.getOverlayTypeClass(type);
        this.state.show = true;
    }

    private closeOverlay(): void {
        this.state.show = false;
    }

    private setOverlayPosition(): void {
        const overlay = (this as any).getEl('overlay');
        if (overlay) {
            // TODO: wenn gefordert: umpositionieren, wenn außerhalb vom "bildschirm"
            if (this.state.position && this.state.position[0]) {
                // TODO: +10 vermutet, laut Preview-Screen
                overlay.style.left = (this.state.position[0] + 10) + 'px';
            } else {
                overlay.style.left = '45%';
            }
            if (this.state.position && this.state.position[1]) {
                // TODO: -112 margin-top von "section", sonst ist das overlay zu tief (egal ob clientY oder pageY)
                overlay.style.top = (this.state.position[1] - 112) + 'px';
            } else {
                overlay.style.top = '45%';
            }
        }
    }

    private getOverlayTypeClass(type: OverlayType): string {
        switch (type) {
            case OverlayType.HINT:
                return 'hint-overlay';
            case OverlayType.INFO:
                return 'info-overlay';
            case OverlayType.WARNING:
                return 'warning-overlay';
            default:
                return '';
        }
    }

    private getWidgetIcon(type: OverlayType): string {
        switch (type) {
            case OverlayType.HINT:
                return 'kix-icon-Question';
            case OverlayType.INFO:
                return 'kix-icon-info';
            case OverlayType.WARNING:
                return 'kix-icon-exclamation';
            default:
                return '';
        }
    }

    private isComponentContent(): boolean {
        return this.state.content instanceof ComponentContent;
    }

    private getTemplate(): any {
        if (this.isComponentContent()) {
            const content = (this.state.content as ComponentContent);
            return ComponentsService.getInstance().getComponentTemplate(content.getValue());
        }

    }

}

module.exports = OverlayComponent;
