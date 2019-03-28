import { AbstractMarkoComponent, IColumn, LabelService } from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { TreeNode, KIXObjectType, ObjectIcon } from '../../../../core/model';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    public filterValues: TreeNode[];
    public filterText: string;
    private column: IColumn;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.column = input.column;
        this.state.nodes = null;
        this.filterValues = null;
        this.filterText = null;
        this.update();
    }

    private async update(): Promise<void> {
        this.state.placeholder = await TranslationService.translate('Translatable#insert filter value');

        if (this.column && this.column.getColumnConfiguration().hasListFilter) {
            this.state.hasListFilter = true;
            const table = this.column.getTable();
            const objectType = table ? table.getObjectType() : null;
            if (objectType) {
                await this.prepareListFilter(objectType);
            }
        } else {
            this.state.hasListFilter = false;
            setTimeout(() => {
                const inputElement = (this as any).getEl('column-filter-input');
                if (inputElement) {
                    inputElement.focus();
                }
            }, 100);
        }
        this.getCurrentValue();
    }

    public async onMount(): Promise<void> {
        // nothing
    }

    public onDestroy(): void {
        // nothing
    }

    private async prepareListFilter(objectType: KIXObjectType): Promise<void> {
        const filterValues = this.column.getFilterValues();
        const nodes = [];
        for (const fv of filterValues) {
            const labelProvider = LabelService.getInstance().getLabelProviderForType(objectType);
            let label = `${fv[0]} (${fv[1]})`;
            let icon: string | ObjectIcon;
            if (labelProvider) {
                const displayValue = await labelProvider.getPropertyValueDisplayText(this.column.getColumnId(), fv[0]);
                label = `${displayValue} (${fv[1]})`;
                const icons = await labelProvider.getIcons(null, this.column.getColumnId(), fv[0]);
                icon = icons && icons.length ? icons[0] : null;
            }
            nodes.push(new TreeNode(fv[0], label, icon, null));
        }
        this.state.nodes = nodes;
    }

    private getCurrentValue(): void {
        if (this.column) {
            const currentfilter = this.column.getFilter();
            if (currentfilter) {
                if (this.state.hasListFilter) {
                    const values = currentfilter[1] && !!currentfilter[1].length
                        ? currentfilter[1][0].value as any[] : [];
                    this.state.selectedNodes = this.state.nodes.filter((n) => values.some((v) => v === n.id));
                } else {
                    this.filterText = currentfilter[0];
                }
            }
        }
    }

    public nodeClicked(node: TreeNode): void {
        const nodeIndex = this.state.selectedNodes.findIndex((n) => n.id === node.id);
        if (nodeIndex !== -1) {
            this.state.selectedNodes.splice(nodeIndex, 1);
        } else {
            this.state.selectedNodes.push(node);
        }
        (this as any).setStateDirty('selectedNodes');

        this.filterValues = this.state.selectedNodes.map((n) => n.id);
        this.filter();
    }

    public textFilterValueChanged(event: any): void {
        this.filterText = event.target.value;
    }

    public filterKeyDown(event: any): void {
        if (event.keyCode === 13 || event.key === 'Enter') {
            this.filterText = event.target.value;
            this.filter();
        }
    }

    private filter(): void {
        if (this.column) {
            if (this.state.hasListFilter) {
                this.column.filter(this.filterValues);
            } else {
                this.column.filter(null, this.filterText);
                (this as any).emit('closeOverlay');
            }
        }
    }
}

module.exports = Component;
