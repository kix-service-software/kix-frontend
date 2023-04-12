/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IWidgetContent } from './IWidgetContent';
import { OverlayType } from './OverlayType';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';

export class OverlayService {

    private static INSTANCE: OverlayService;
    private overlayListener: Map<string, any> = new Map();

    public static getInstance(): OverlayService {
        if (!OverlayService.INSTANCE) {
            OverlayService.INSTANCE = new OverlayService();
        }

        return OverlayService.INSTANCE;
    }

    private constructor() { }

    private overlayComponentListener:
        <T extends KIXObject>(
            type: OverlayType, instanceId: string, content: IWidgetContent<T>, title: string, icon: string | ObjectIcon,
            closeButton: boolean, position: [number, number], listenerId: string, large: boolean,
            toastTimeoutMillis?: number, autoClose?: boolean
        ) => void;

    public registerOverlayComponentListener(
        listener:
            <T extends KIXObject>(
                type: OverlayType, instanceId: string, content: IWidgetContent<T>, title: string,
                icon: string | ObjectIcon, closeButton: boolean, position: [number, number],
                listenerId: string, large: boolean, toastTimeoutMillis?: number, autoClose?: boolean
            ) => void
    ): void {
        this.overlayComponentListener = listener;
    }

    public registerOverlayListener(listenerId: string, listener: any): void {
        this.overlayListener.set(listenerId, listener);
    }

    public unregisterOverlayListener(listenerId: string): void {
        this.overlayListener.delete(listenerId);
    }

    public openOverlay<T extends KIXObject>(
        type: OverlayType, instanceId: string, content: IWidgetContent<T>, title: string, icon?: string | ObjectIcon,
        closeButton: boolean = false, position?: [number, number], listenerId?: string, large?: boolean,
        toastTimeoutMillis?: number, autoClose: boolean = true
    ): void {
        if (this.overlayComponentListener) {
            this.overlayComponentListener(
                type, instanceId, content, title, icon, closeButton, position, listenerId,
                large, toastTimeoutMillis, autoClose
            );
        }
    }

    public overlayOpened(listenerId: string): void {
        const listener = this.overlayListener.get(listenerId);
        if (listener) {
            listener.overlayOpened();
        }
    }

    public overlayClosed(listenerId: string): void {
        const listener = this.overlayListener.get(listenerId);
        if (listener) {
            listener.overlayClosed();
        }
    }

}
