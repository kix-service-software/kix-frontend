import { OverlayComponentState } from "./OverlayComponentState";
import { OverlayService, ActionFactory, WidgetService } from "@kix/core/dist/browser";
import {
    OverlayType, IWidgetContent, ObjectIcon, ComponentContent, Context, WidgetType, KIXObject
} from "@kix/core/dist/model";
import { ContextService } from "@kix/core/dist/browser/context";
import { ComponentsService } from "@kix/core/dist/browser/components";

class OverlayComponent {

    private state: OverlayComponentState;
    private toastTimeout: any;

    public onCreate(): void {
        this.state = new OverlayComponentState();
    }

    public onMount(): void {
        OverlayService.getInstance().registerOverlayListener(this.openOverlay.bind(this));

        WidgetService.getInstance().setWidgetType(this.state.instanceId, WidgetType.OVERLAY);

        // document.addEventListener("click", (event: any) => {
        //     if (this.state.show && !this.showShield()) {
        //         if (this.state.keepShow) {
        //             this.state.keepShow = false;
        //         } else {
        //             this.closeOverlay();
        //         }
        //     }
        // }, false);
    }

    private overlayClicked(): void {
        this.state.keepShow = true;
    }

    public onUpdate(): void {
        if (this.state.position && this.state.position.length === 2) {
            this.setOverlayPosition();
        }
    }

    private openOverlay<T extends KIXObject<T>>(
        type: OverlayType, instanceId: string, content: IWidgetContent<T>, title: string,
        closeButton: boolean, position: [number, number]
    ): void {
        this.state.title = title;
        this.state.icon = this.getWidgetIcon(type);
        this.state.content = content;
        this.state.hasCloseButton = closeButton;
        this.state.position = position;
        this.state.type = type;
        this.state.overlayClass = this.getOverlayTypeClass(type);

        this.applyWidgetConfiguration(instanceId);

        this.state.keepShow = true;
        this.state.show = true;

        // TODO: Prüfen auf "einfachere" Methode bzw. Umbauen, falls es anders funktionieren soll
        if (type === OverlayType.TOAST) {
            this.toastTimeout = setTimeout(() => {
                const toast = (this as any).getEl('overlay');
                // if (toast) {
                //     // TODO: ggf. über Marko triggern (Funktionen implementieren), falls es so bleibt
                //     toast.addEventListener('mouseover', (e) => {
                //         clearTimeout(this.toastTimeout);
                //     });
                //     toast.addEventListener('mouseleave', (e) => {
                //         this.state.overlayClass = 'toast-overlay';
                //         this.toastTimeout = setTimeout(() => {
                //             // this.closeOverlay();
                //         }, 200);
                //     });
                // }
                this.state.overlayClass += ' show-toast';
                this.toastTimeout = setTimeout(() => {
                    this.state.overlayClass = 'toast-overlay';
                    this.toastTimeout = setTimeout(() => {
                        // this.closeOverlay();
                    }, 200);
                }, 20000000);
            }, 100);
        }
    }

    private applyWidgetConfiguration(instanceId: string): void {
        if (instanceId && instanceId !== '') {
            const context = ContextService.getInstance().getContext();
            const widgetConfiguration = context.getWidgetConfiguration(instanceId);
            if (widgetConfiguration) {
                this.state.actions = ActionFactory.getInstance().generateActions(
                    widgetConfiguration.actions, false, this.state.content.getActionObject()
                );
                this.state.title = widgetConfiguration.title;
                this.state.icon = widgetConfiguration.icon;
            }
        }
    }

    private closeOverlay(): void {
        this.state.show = false;
        this.state = new OverlayComponentState();
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }
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
            case OverlayType.TOAST:
                return 'toast-overlay';
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
            const content = (this.state.content as ComponentContent<any>);
            return ComponentsService.getInstance().getComponentTemplate(content.getValue());
        }

    }

    private showShield(): boolean {
        return this.state.type === OverlayType.WARNING;
    }

    private isToast(): boolean {
        return this.state.type === OverlayType.TOAST;
    }
}

module.exports = OverlayComponent;
