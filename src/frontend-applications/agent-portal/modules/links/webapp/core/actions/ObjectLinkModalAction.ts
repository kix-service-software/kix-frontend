/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { PlaceholderService } from '../../../../base-components/webapp/core/PlaceholderService';
import { KIXModulesService } from '../../../../base-components/webapp/core/KIXModulesService';

declare const bootstrap: any;

export class ObjectLinkModalAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [];

    public async initAction(): Promise<void> {
        this.icon = 'kix-icon-link';

        const context = ContextService.getInstance().getActiveContext();
        const object = await context.getObject();

        const linkCount = await PlaceholderService.getInstance().replacePlaceholders(
            '<KIX_OBJECT_LinkCount>', object
        );
        const linksText = await TranslationService.translate('Translatable#Show Links');

        this.text = `${linksText} (${linkCount})`;
    }

    public async run(event: any): Promise<void> {
        this.openLinksModal();
    }

    public openLinksModal(): void {
        const modalArea = document.getElementById('kix-modal-area');
        if (modalArea) {
            const template = KIXModulesService.getComponentTemplate('object-links-modal');
            const content = template?.default?.renderSync({});
            content.appendTo(modalArea);

            const templateModal = new bootstrap.Modal('#object-links-modal', {});
            templateModal?.show();

            const modalElement = document.getElementById('object-links-modal');
            modalElement.addEventListener('hidden.bs.modal', (event) => {
                modalElement?.remove();
            });
        }
    }
}
