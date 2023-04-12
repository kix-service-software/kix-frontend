/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { ToastContent } from '../../../../../modules/base-components/webapp/core/ToastContent';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';

class OverlayComponent {

    private state: ComponentState;
    private toastTimeout: any;
    private currentListenerId: string;
    private startMoveOffset: [number, number] = null;
    private startResizeOffset: [number, number] = null;
    private position: [number, number] = null;
    private keepShow = true;
    private clickListener: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Close Overlay'
        ]);

        OverlayService.getInstance().registerOverlayComponentListener(this.openOverlay.bind(this));

        WidgetService.getInstance().setWidgetType(this.state.overlayInstanceId, WidgetType.OVERLAY);

        document.addEventListener('mousemove', this.mouseMove.bind(this), false);
        document.addEventListener('mouseup', this.mouseUp.bind(this), false);

        EventService.getInstance().subscribe(ApplicationEvent.CLOSE_OVERLAY, {
            eventSubscriberId: 'overlay',
            eventPublished: (): void => {
                this.closeOverlay();
            }
        });
    }

    public onUpdate(): void {
        this.setOverlayPosition();
    }

    public overlayClicked(event: any): void {
        this.keepShow = true;
    }

    private openOverlay<T extends KIXObject>(
        type: OverlayType, widgetInstanceId: string, content: ComponentContent<T>, title: string,
        icon: string | ObjectIcon, closeButton: boolean, position: [number, number],
        newListenerId: string, large: boolean, toastTimeoutMillis: number = 2000, autoClose: boolean = true
    ): void {
        if (this.currentListenerId) {
            this.closeOverlay();
        }
        this.state.show = false;
        this.keepShow = true;
        if (autoClose) {
            this.clickListener = (event: any): void => {
                if (!this.keepShow && !this.showShield() && event.button === 0) {
                    this.closeOverlay();
                }
                this.keepShow = false;
            };
            document.addEventListener('click', this.clickListener, false);
        }

        setTimeout(async () => {
            this.state.title = title;
            this.state.icon = icon || this.getWidgetIcon(type);
            this.state.content = content;
            this.state.hasCloseButton = closeButton;
            this.state.type = type;
            this.position = position;

            if (this.position && this.position[0]) {
                this.position[0] += window.scrollX;
            }
            if (this.position && this.position[1]) {
                this.position[1] += window.scrollY;
            }

            this.state.overlayClass = this.getOverlayTypeClass(type, large);
            this.currentListenerId = newListenerId;

            this.applyWidgetConfiguration(widgetInstanceId);

            this.state.show = true;

            if (this.isToast()) {
                if (type && type === OverlayType.SUCCESS_TOAST) {
                    const toastContent = this.state.content.getComponentData() as ToastContent;
                    if (toastContent && typeof toastContent.title === 'undefined') {
                        toastContent.title = await TranslationService.translate('Translatable#Success!');
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
                        toast.classList.add('show-toast');
                        this.toastTimeout = setTimeout(() => {
                            toast.classList.remove('show-toast');
                            this.toastTimeout = setTimeout(() => {
                                this.closeOverlay();
                            }, 200);
                        }, toastTimeoutMillis);
                    }
                }, 100);
            } else if (this.state.hasCloseButton) {
                this.toastTimeout = setTimeout(() => {
                    const button = (this as any).getEl('close-button');
                    if (button) {
                        button.focus();
                    }
                }, 100);
            }

            if (this.currentListenerId) {
                OverlayService.getInstance().overlayOpened(this.currentListenerId);
            }
        }, 50);
    }

    private async applyWidgetConfiguration(widgetInstanceId: string): Promise<void> {
        if (widgetInstanceId && widgetInstanceId !== '') {
            const context = ContextService.getInstance().getActiveContext();
            const widgetConfiguration = await context.getWidgetConfiguration(widgetInstanceId);
            if (widgetConfiguration) {
                this.state.actions = await ActionFactory.getInstance().generateActions(
                    widgetConfiguration.actions, this.state.content.getActionObject()
                );
                WidgetService.getInstance().registerActions(this.state.overlayInstanceId, this.state.actions, false);
                this.state.title = widgetConfiguration.title || this.state.title;
                this.state.icon = widgetConfiguration.icon || this.state.icon;
            }
        }
    }

    private closeOverlay(): void {
        this.state.show = false;
        document.removeEventListener('click', this.clickListener, false);
        document.removeEventListener('mouseup', this.mouseUp.bind(this), false);
        document.removeEventListener('mousemove', this.mouseMove.bind(this), false);
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }
        if (this.currentListenerId) {
            OverlayService.getInstance().overlayClosed(this.currentListenerId);
            this.currentListenerId = null;
        }
        if (this.state.actions) {
            WidgetService.getInstance().unregisterActions(this.state.overlayInstanceId);
        }
        this.state = new ComponentState();
    }

    private setOverlayPosition(): void {
        const overlay = (this as any).getEl('overlay');
        if (overlay) {
            if (this.state.type === OverlayType.HINT_TOAST) {
                overlay.style.top = '8rem';
                overlay.style.right = '3rem';
                overlay.style.opacity = 1;
            } else {
                if (!this.position || !this.position.length) {
                    this.position = [null, null];
                }

                this.setLeftPosition(overlay);
                if (!this.isToast()) {
                    this.setTopPosition(overlay);
                }
            }
        }
    }

    private setLeftPosition(overlay: any = (this as any).getEl('overlay')): void {
        if (overlay) {
            if (this.position[0]) {
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

    private topPositionTimeout = null;
    private setTopPosition(overlay: any = (this as any).getEl('overlay')): void {
        if (overlay) {
            // small timeout, because overlay class change takes effect with some delay (content could need more height)
            if (this.topPositionTimeout) {
                clearTimeout(this.topPositionTimeout);
            }
            this.topPositionTimeout = setTimeout(() => {
                if (!this.position || !this.position.length) {
                    this.position = [null, null];
                }
                if (this.position[1]) {
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
                return 'toast-overlay reload-toast';
            case OverlayType.INFO_TOAST:
                return 'toast-overlay info-toast';
            case OverlayType.ERROR_TOAST:
                return 'toast-overlay error-toast';
            case OverlayType.CONTENT_OVERLAY:
                return 'content-overlay' + (large ? ' large' : '');
            case OverlayType.TABLE_COLUMN_FILTER:
                return 'table-column-filter-overlay';
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
            return KIXModulesService.getComponentTemplate(content.getValue());
        }

    }

    private showShield(): boolean {
        return this.state.type === OverlayType.WARNING || this.state.type === OverlayType.CONFIRM;
    }

    public hasClosable(): boolean {
        return !this.isToast()
            && this.state.type !== OverlayType.CONFIRM
            && this.state.type !== OverlayType.TABLE_COLUMN_FILTER;
    }

    public isToast(): boolean {
        return this.state.type === OverlayType.SUCCESS_TOAST
            || this.state.type === OverlayType.INFO_TOAST;
    }

    public canResize(): boolean {
        return this.state.type === OverlayType.INFO || this.state.type === OverlayType.CONTENT_OVERLAY;
    }

    public startMove(event: any): void {
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
}

module.exports = OverlayComponent;
