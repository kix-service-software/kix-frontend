/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXModulesService } from '../../../base-components/webapp/core/KIXModulesService';

declare const bootstrap: any;

export class ToastUtil {

    private static showRefreshToastTimeout: any;

    public static async showInfoToast(message: string): Promise<void> {
        this.showToast('info-toast', { message });
    }

    public static async showErrorToast(message: string): Promise<void> {
        this.showToast('error-toast', { message });
    }

    public static async showSuccessToast(message: string): Promise<void> {
        this.showToast('success-toast', { message });
    }

    public static showRefreshToast(): void {
        if (this.showRefreshToastTimeout) {
            clearTimeout(this.showRefreshToastTimeout);
        }

        this.showRefreshToastTimeout = setTimeout(() => {
            this.showToast('refresh-app-toast', {});
        }, 200);
    }

    private static showToast(toastId: string, toastData: any = {}): void {
        const toastArea = document.getElementById('kix-toast-area');
        if (toastArea) {
            const template = KIXModulesService.getComponentTemplate(toastId);
            const content = template?.default?.renderSync(toastData);
            content.appendTo(toastArea);

            const templateToast = new bootstrap.Toast(`#${toastId}`);
            templateToast.show();

            const toastElement = document.getElementById(toastId);
            toastElement.addEventListener('hidden.bs.toast', (event) => {
                toastElement?.remove();
            });
        }
    }

}