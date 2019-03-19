import { OverlayType, IWidgetContent, ObjectIcon, KIXObject } from "../model";

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
        <T extends KIXObject<T>>(
            type: OverlayType, instanceId: string, content: IWidgetContent<T>, title: string,
            closeButton: boolean, position: [number, number], listenerId: string, large: boolean,
            toastTimeoutMillis?: number
        ) => void;

    public registerOverlayComponentListener(
        listener:
            <T extends KIXObject<T>>(
                type: OverlayType, instanceId: string, content: IWidgetContent<T>, title: string,
                closeButton: boolean, position: [number, number], listenerId: string, large: boolean,
                toastTimeoutMillis?: number
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

    public openOverlay<T extends KIXObject<T>>(
        type: OverlayType, instanceId: string, content: IWidgetContent<T>, title: string,
        closeButton: boolean = false, position?: [number, number], listenerId?: string, large?: boolean,
        toastTimeoutMillis?: number
    ): void {
        if (this.overlayComponentListener) {
            this.overlayComponentListener(
                type, instanceId, content, title, closeButton, position, listenerId, large, toastTimeoutMillis
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
