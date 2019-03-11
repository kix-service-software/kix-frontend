import { ComponentState } from './ComponentState';
import { CreateLinkDescription, FormInputComponent } from '../../../../../core/model';
import { FormService, LabelService, IdService, Label } from '../../../../../core/browser';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';
import { DialogService } from '../../../../../core/browser/components/dialog';

class ArticleInputAttachmentComponent extends FormInputComponent<CreateLinkDescription[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public async openDialog(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const objectType = formInstance.getObjectType();

        let dialogTitle = await TranslationService.translate('Translatable#Link Objects');
        const labelProvider = LabelService.getInstance().getLabelProviderForType(objectType);
        if (labelProvider) {
            const objectName = await labelProvider.getObjectName();
            dialogTitle = await TranslationService.translate('Translatable#link {0}', [objectName]);
        }

        const resultListenerId = 'result-listener-link-' + objectType + IdService.generateDateBasedId();
        DialogService.getInstance().openOverlayDialog(
            'link-object-dialog',
            {
                linkDescriptions: this.state.linkDescriptions,
                objectType,
                resultListenerId
            },
            dialogTitle,
            'kix-icon-link'
        );
        DialogService.getInstance()
            .registerDialogResultListener<CreateLinkDescription[][]>(
                resultListenerId, 'object-link', this.linksChanged.bind(this)
            );
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

    private createLabels(): void {
        this.state.labels = this.state.linkDescriptions.map((ld) => {
            const linkLabel = ld.linkTypeDescription.asSource
                ? ld.linkTypeDescription.linkType.SourceName
                : ld.linkTypeDescription.linkType.TargetName;
            return new Label(ld.linkableObject, null, null, null, `(${linkLabel})`);
        });
    }

}

module.exports = ArticleInputAttachmentComponent;
