/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { CreateLinkDescription } from '../../../server/api/CreateLinkDescription';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { AuthenticationSocketClient } from '../../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';

class ArticleInputAttachmentComponent extends FormInputComponent<CreateLinkDescription[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Assign Links'
        ]);

        this.state.allowCreate = await AuthenticationSocketClient.getInstance().checkPermissions([
            new UIComponentPermission('links', [CRUD.READ, CRUD.CREATE])
        ]);
    }

    public async setCurrentValue(): Promise<void> {
        return;
    }

    public async openDialog(): Promise<void> {
        // const context = ContextService.getInstance().getActiveContext();
        // const formInstance = await context?.getFormManager()?.getFormInstance();
        // const objectType = formInstance.getObjectType();

        // const objectName = await LabelService.getInstance().getObjectName(objectType);
        // const dialogTitle = await TranslationService.translate('Translatable#link {0}', [objectName]);

        // const resultListenerId = 'result-listener-link-' + objectType + IdService.generateDateBasedId();
        // TODO: Overlay
        // DialogService.getInstance().openOverlayDialog(
        //     'link-object-dialog',
        //     {
        //         linkDescriptions: this.state.linkDescriptions,
        //         objectType,
        //         resultListenerId
        //     },
        //     dialogTitle,
        //     'kix-icon-link'
        // );
        // DialogService.getInstance()
        //     .registerDialogResultListener<CreateLinkDescription[][]>(
        //         resultListenerId, 'object-link', this.linksChanged.bind(this)
        //     );
    }

    private linksChanged(result: CreateLinkDescription[][]): void {
        this.state.linkDescriptions = [...result[0]];
        this.updateField();
    }

    public minimize(): void {
        this.state.minimized = !this.state.minimized;
    }

    public removeLink(label: Label): void {
        const index = this.state.linkDescriptions.findIndex((ld) => ld.linkableObject === label.object);
        if (index !== -1) {
            this.state.linkDescriptions.splice(index, 1);
            this.updateField();
        }
    }

    private updateField(): void {
        this.state.loading = true;
        this.createLabels();
        super.provideValue(this.state.linkDescriptions);

        setTimeout(() => {
            this.state.loading = false;
        }, 50);
    }

    private async createLabels(): Promise<void> {
        const labels = [];
        for (const ld of this.state.linkDescriptions) {
            const linkLabel = await TranslationService.translate(ld.linkTypeDescription.asSource
                ? ld.linkTypeDescription.linkType.SourceName
                : ld.linkTypeDescription.linkType.TargetName);
            labels.push(new Label(ld.linkableObject, null, null, null, `(${linkLabel})`));
        }
        this.state.labels = labels;
    }

}

module.exports = ArticleInputAttachmentComponent;
