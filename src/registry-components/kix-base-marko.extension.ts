import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class KIXMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            ...this.getDialogFormDependencies(),
            ...this.getGeneralWidgetDependencies(),
            'quick-search',
            '_base-components/base-html-components/list-with-title',
            '_base-components/dialog/link-object-dialog',
            '_base-components/dialog/edit-linked-objects-dialog',
            '_base-components/widget-container',
            '_base-components/chart'
        ];
    }

    private getDialogFormDependencies(): string[] {
        return [
            '_base-components/form/inputs/form-default-input',
            '_base-components/form/inputs/form-list',
            '_base-components/form/inputs/rich-text-input',
            '_base-components/form/inputs/valid-input',
            '_base-components/form/inputs/attachment-input',
            '_base-components/form/inputs/link-input',
            '_base-components/form/inputs/language-input',
            '_base-components/form/inputs/general-catalog-input',
            '_base-components/form/inputs/text-area-input',
            '_base-components/form/inputs/object-reference-input',
            '_base-components/form/inputs/date-time-input'
        ];
    }

    private getGeneralWidgetDependencies(): string[] {
        return [
            'widgets/notes-widget'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ...this.getDialogFormTags(),
            ...this.getGeneralWidgetTags(),
            ['icon', '_base-components/icon'],
            ['list-with-title', '_base-components/base-html-components/list-with-title'],
            ['link-object-dialog', '_base-components/dialog/link-object-dialog'],
            ['edit-linked-objects-dialog', '_base-components/dialog/edit-linked-objects-dialog']
        ];
    }

    private getDialogFormTags(): Array<[string, string]> {
        return [
            ['form-default-input', '_base-components/form/inputs/form-default-input'],
            ['form-list', '_base-components/form/inputs/form-list'],
            ['rich-text-input', '_base-components/form/inputs/rich-text-input'],
            ['valid-input', '_base-components/form/inputs/valid-input'],
            ['attachment-input', '_base-components/form/inputs/attachment-input'],
            ['link-input', '_base-components/form/inputs/link-input'],
            ['language-input', '_base-components/form/inputs/language-input'],
            ['general-catalog-input', '_base-components/form/inputs/general-catalog-input'],
            ['text-area-input', '_base-components/form/inputs/text-area-input'],
            ['object-reference-input', '_base-components/form/inputs/object-reference-input'],
            ['date-time-input', '_base-components/form/inputs/date-time-input']
        ];
    }

    private getGeneralWidgetTags(): Array<[string, string]> {
        return [
            ['notes-widget', 'widgets/notes-widget']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new KIXMarkoDependencyExtension();
};
