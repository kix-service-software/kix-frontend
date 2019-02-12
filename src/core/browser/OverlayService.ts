import { OverlayType, IWidgetContent, ObjectIcon, KIXObject } from "../model";

export class OverlayService {

    private static INSTANCE: OverlayService;
    private overlayIconListener: Map<string, any> = new Map();

    public static getInstance(): OverlayService {
        if (!OverlayService.INSTANCE) {
            OverlayService.INSTANCE = new OverlayService();
        }

        return OverlayService.INSTANCE;
    }

    private constructor() { }

    private overlayListener:
        <T extends KIXObject<T>>(
            type: OverlayType, instanceId: string, content: IWidgetContent<T>, title: string,
            closeButton: boolean, position: [number, number], iconId: string, large: boolean
        ) => void;

    public registerOverlayListener(
        listener:
            <T extends KIXObject<T>>(
                type: OverlayType, instanceId: string, content: IWidgetContent<T>, title: string,
                closeButton: boolean, position: [number, number], iconId: string, large: boolean
            ) => void
    ): void {
        this.overlayListener = listener;
    }

    public registerOverlayIconListener(iconId: string, listener: any): void {
        this.overlayIconListener.set(iconId, listener);
    }

    public unRegisterOverlayIconListener(iconId: string): void {
        this.overlayIconListener.delete(iconId);
    }

    public openOverlay<T extends KIXObject<T>>(
        type: OverlayType, instanceId: string, content: IWidgetContent<T>, title: string,
        closeButton: boolean = false, position?: [number, number], iconId?: string, large?: boolean
    ): void {
        if (this.overlayListener) {
            this.overlayListener(type, instanceId, content, title, closeButton, position, iconId, large);
        }
    }

    public overlayOpened(iconId: string): void {
        const listener = this.overlayIconListener.get(iconId);
        if (listener) {
            listener.overlayOpened();
        }
    }

    public overlayClosed(iconId: string): void {
        const listener = this.overlayIconListener.get(iconId);
        if (listener) {
            listener.overlayClosed();
        }
    }

}
