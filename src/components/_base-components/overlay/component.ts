import { ComponentState } from "./ComponentState";
import { OverlayService, ActionFactory, WidgetService } from "@kix/core/dist/browser";
import {
    OverlayType, ComponentContent, WidgetType, KIXObject, ToastContent
} from "@kix/core/dist/model";
import { ContextService } from "@kix/core/dist/browser/context";
import { ComponentsService } from "@kix/core/dist/browser/components";

class OverlayComponent {

    private state: ComponentState;
    private toastTimeout: any;
    private overlayIconId: string;
    private startMoveOffset: [number, number] = null;
    private startResizeOffset: [number, number] = null;
    private position: [number, number] = null;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        OverlayService.getInstance().registerOverlayListener(this.openOverlay.bind(this));

        WidgetService.getInstance().setWidgetType(this.state.overlayInstanceId, WidgetType.OVERLAY);

        document.addEventListener("click", (event: any) => {
            this.closeOverlayEventHandler(event);
        }, false);
        document.addEventListener('mousemove', this.mouseMove.bind(this));
        document.addEventListener('mouseup', this.mouseUp.bind(this));
    }

    public onDestroy(): void {
        document.removeEventListener("click", (event: any) => {
            this.closeOverlayEventHandler(event);
        }, false);
        document.removeEventListener('mousemove', this.mouseMove.bind(this));
        document.removeEventListener('mouseup', this.mouseUp.bind(this));
    }

    private closeOverlayEventHandler(event: any): void {
        if (this.state.show && !this.showShield() && event.button === 0) {
            if (this.state.keepShow) {
                this.state.keepShow = false;
            } else {
                this.closeOverlay();
            }
        }
    }

    public overlayClicked(): void {
        this.state.keepShow = true;
    }

    public onUpdate(): void {
        this.setOverlayPosition();
    }

    private openOverlay<T extends KIXObject<T>>(
        type: OverlayType, widgetInstanceId: string, content: ComponentContent<T>, title: string,
        closeButton: boolean, position: [number, number], iconId: string, large: boolean
    ): void {
        if (this.overlayIconId) {
            this.closeOverlay();
        }
        this.state.title = title;
        this.state.icon = this.getWidgetIcon(type);
        this.state.content = content;
        this.state.hasCloseButton = closeButton;
        this.state.type = type;
        this.position = position;
        this.state.overlayClass = this.getOverlayTypeClass(type, large);
        this.overlayIconId = iconId;

        this.applyWidgetConfiguration(widgetInstanceId);

        this.state.keepShow = true;
        this.state.show = true;

        if (this.isToast()) {
            if (type && type === OverlayType.SUCCESS_TOAST) {
                const toastContent = this.state.content.getComponentData() as ToastContent;
                if (toastContent && typeof toastContent.title === 'undefined') {
                    toastContent.title = 'Erfolgreich!';
                }
            }
            this.toastTimeout = setTimeout(() => {
                const toast = (this as any).getEl('overlay');
                if (toast) {
                    toast.addEventListener('mouseover', (e) => {
                        clearTimeout(this.toastTimeout);
                    });
                    toast.addEventListener('mouseleave', (e) => {
                        toast.classList.remove('show-toast');
                        this.toastTimeout = setTimeout(() => {
                            this.closeOverlay();
                        }, 200);
                    });
                }
                toast.classList.add('show-toast');
                this.toastTimeout = setTimeout(() => {
                    toast.classList.remove('show-toast');
                    this.toastTimeout = setTimeout(() => {
                        this.closeOverlay();
                    }, 200);
                }, 2000);
            }, 100);
        }

        if (this.overlayIconId) {
            OverlayService.getInstance().overlayOpened(iconId);
            if (this.position && !!this.position.length && typeof this.position[0] === 'number') {
                // + default font-size (next to icon)
                this.position[0] += this.getBrowserFontsize();
            }
        }
    }

    private applyWidgetConfiguration(widgetInstanceId: string): void {
        if (widgetInstanceId && widgetInstanceId !== '') {
            const context = ContextService.getInstance().getActiveContext();
            const widgetConfiguration = context.getWidgetConfiguration(widgetInstanceId);
            if (widgetConfiguration) {
                this.state.actions = ActionFactory.getInstance().generateActions(
                    widgetConfiguration.actions, this.state.content.getActionObject()
                );
                WidgetService.getInstance().registerActions(this.state.overlayInstanceId, this.state.actions, false);
                this.state.title = widgetConfiguration.title;
                this.state.icon = widgetConfiguration.icon;
            }
        }
    }

    private closeOverlay(): void {
        this.state.show = false;
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }
        if (this.overlayIconId) {
            OverlayService.getInstance().overlayClosed(this.overlayIconId);
            this.overlayIconId = null;
        }
        if (this.state.actions) {
            WidgetService.getInstance().unregisterActions(this.state.overlayInstanceId);
        }
        this.state = new ComponentState();
    }

    private setOverlayPosition(): void {
        if (!this.position || !!!this.position.length) {
            this.position = [null, null];
        }
        const overlay = (this as any).getEl('overlay');
        if (overlay) {
            this.setLeftPosition(overlay);
            if (!this.isToast()) {
                this.setTopPosition(overlay);
            }
        }
    }

    private setLeftPosition(overlay: any = (this as any).getEl('overlay')): void {
        if (overlay) {
            if (this.position && this.position[0]) {
                if (this.position[0] + overlay.offsetWidth > document.body.offsetWidth + window.scrollX) {
                    this.position[0] = document.body.offsetWidth + window.scrollX - overlay.offsetWidth - 15;
                }
            } else {
                this.position[0]
                    = Math.floor(document.body.offsetWidth / 2) - Math.floor(overlay.offsetWidth / 2);
            }
            overlay.style.left = this.position[0] + 'px';
        }
    }

    private setTopPosition(overlay: any = (this as any).getEl('overlay')): void {
        if (overlay) {
            // small timeout, because overlay class change takes effect with some delay (content could need more height)
            setTimeout(() => {
                if (this.position && this.position[1]) {
                    if (this.position[1] + overlay.offsetHeight > document.body.offsetHeight + window.scrollY) {
                        this.position[1]
                            = document.body.offsetHeight + window.scrollY - overlay.offsetHeight - 15;
                    }
                } else {
                    this.position[1]
                        = Math.floor(document.body.offsetHeight / 2) - Math.floor(overlay.offsetHeight / 2) - 50;
                }
                overlay.style.top = this.position[1] + 'px';
                overlay.style.opacity = 1;
            }, 10);
        }
    }

    private getOverlayTypeClass(type: OverlayType, large: boolean = false): string {
        switch (type) {
            case OverlayType.HINT:
                return 'hint-overlay';
            case OverlayType.INFO:
                return 'info-overlay' + (large ? ' large' : '');
            case OverlayType.WARNING:
                return 'warning-overlay';
            case OverlayType.CONFIRM:
                return 'confirm-overlay';
            case OverlayType.SUCCESS_TOAST:
                return 'toast-overlay success-toast';
            case OverlayType.HINT_TOAST:
                return 'toast-overlay';
            case OverlayType.CONTENT_OVERLAY:
                return 'content-overlay' + (large ? ' large' : '');
            default:
                return '';
        }
    }

    private getWidgetIcon(type: OverlayType): string {
        switch (type) {
            case OverlayType.HINT:
                return 'kix-icon-question';
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

    public getTemplate(): any {
        if (this.isComponentContent()) {
            const content = (this.state.content as ComponentContent<any>);
            return ComponentsService.getInstance().getComponentTemplate(content.getValue());
        }

    }

    private showShield(): boolean {
        return this.state.type === OverlayType.WARNING;
    }

    public isToast(): boolean {
        return this.state.type === OverlayType.SUCCESS_TOAST
            || this.state.type === OverlayType.HINT_TOAST;
    }

    public canResize(): boolean {
        return this.state.type === OverlayType.INFO || this.state.type === OverlayType.CONTENT_OVERLAY;
    }

    public startMove(event: any) {
        if (event && event.button === 0) {
            this.startMoveOffset = [event.pageX, event.pageY];
            document.body.classList.add('no-select');
        }
    }

    public startResize(event: any): void {
        if (event && event.button === 0) {
            this.startResizeOffset = [event.pageX, event.pageY];
            document.body.classList.add('no-select');
        }
    }

    public mouseMove(event: any): void {
        const overlay = (this as any).getEl('overlay');
        if (overlay) {
            if (this.startMoveOffset) {
                if (this.startMoveOffset[0] !== event.pageX) {
                    const gap = event.pageX - this.startMoveOffset[0];
                    this.startMoveOffset[0] = event.pageX;
                    this.position[0] = Number(overlay.style.left.replace('px', '')) + gap;
                    overlay.style.left = this.position[0] + 'px';
                }
                if (this.startMoveOffset[1] !== event.pageY) {
                    const gap = event.pageY - this.startMoveOffset[1];
                    this.startMoveOffset[1] = event.pageY;
                    this.position[1] = Number(overlay.style.top.replace('px', '')) + gap;
                    overlay.style.top = this.position[1] + 'px';
                }
            }
            if (this.startResizeOffset) {
                if (this.startResizeOffset[0] !== event.pageX) {
                    const gap = event.pageX - this.startResizeOffset[0];
                    this.startResizeOffset[0] = event.pageX;
                    overlay.style.width = (overlay.offsetWidth + gap) + 'px';
                }
                if (this.startResizeOffset[1] !== event.pageY) {
                    const gap = event.pageY - this.startResizeOffset[1];
                    this.startResizeOffset[1] = event.pageY;
                    overlay.style.height = (overlay.offsetHeight + gap) + 'px';
                }
            }
        }
    }

    private async mouseUp(): Promise<void> {
        if (this.startResizeOffset || this.startMoveOffset) {
            this.startResizeOffset = null;
            this.startMoveOffset = null;
            document.body.classList.remove('no-select');
        }
    }

    private getBrowserFontsize(): number {
        const browserFontSizeSetting = window
            .getComputedStyle(document.getElementsByTagName("body")[0], null)
            .getPropertyValue("font-size");
        return Number(browserFontSizeSetting.replace('px', ''));
    }
}

module.exports = OverlayComponent;
