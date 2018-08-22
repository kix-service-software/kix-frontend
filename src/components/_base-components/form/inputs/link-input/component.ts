import { ComponentState } from "./ComponentState";
import { CreateLinkDescription, FormInputComponent } from "@kix/core/dist/model";
import { DialogService } from "@kix/core/dist/browser/dialog/DialogService";
import { Label } from "@kix/core/dist/browser/components";
import { FormService, LabelService } from "@kix/core/dist/browser";

class ArticleInputAttachmentComponent extends FormInputComponent<CreateLinkDescription[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
    }

    public openDialog(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        const objectType = formInstance.getObjectType();

        let dialogTitle = 'Objekt verknüpfen';
        const labelProvider = LabelService.getInstance().getLabelProviderForType(objectType);
        if (labelProvider) {
            dialogTitle = `${labelProvider.getObjectName(false)} verknüpfen`;
        }

        const resultListenerId = 'result-listener-link-' + objectType;
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
        this.state.linkDescriptions = result[0];
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
            this.createLabels();
        }
    }

    private updateField(): void {
        this.createLabels();
        super.provideValue(this.state.linkDescriptions);
    }

    private createLabels(): void {
        this.state.labels = this.state.linkDescriptions.map((ld) => {
            const linkLabel = ld.linkTypeDescription.asSource
                ? ld.linkTypeDescription.linkType.SourceName
                : ld.linkTypeDescription.linkType.TargetName;
            return new Label(ld.linkableObject, null, null, null, `(${linkLabel})`);
        });
        (this as any).setStateDirty('labels');
    }

}

module.exports = ArticleInputAttachmentComponent;
