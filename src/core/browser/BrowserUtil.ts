import { OverlayService } from "./OverlayService";
import { OverlayType, StringContent, ComponentContent, ToastContent } from "../model";

export class BrowserUtil {

    public static openErrorOverlay(error: string): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }

    public static openSuccessOverlay(message: string): void {
        const content = new ComponentContent('toast', new ToastContent('kix-icon-check', message));
        OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
    }

    public static startBrowserDownload(fileName: string, content: string, contentType: string): void {
        content = content.replace(/\r?\n|\r/, '\n');
        const a = window.document.createElement('a');
        a.href = 'data:' + contentType + ';base64,' + content;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    public static readFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                let content = reader.result.toString();
                content = content.split(',')[1];
                resolve(content);
            };
            reader.readAsDataURL(file);
        });

    }

    public static calculateAverage(values: number[]): number {
        if (values && values.length) {
            let sum = 0;
            values.forEach((v) => sum += v);
            return BrowserUtil.round(sum / values.length);
        }
        return 0;
    }

    private static round(value: number, step: number = 0.5): number {
        const inv = 1.0 / step;
        return Math.round(value * inv) / inv;
    }

}
