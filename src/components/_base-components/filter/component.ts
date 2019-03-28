import { ComponentState } from './ComponentState';
import { KIXObjectPropertyFilter, TreeNode } from '../../../core/model';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        if (input.predefinedFilter) {
            this.state.predefinedFilter = input.predefinedFilter;
            this.state.predefinedFilterList = this.state.predefinedFilter.map(
                (pf: KIXObjectPropertyFilter, index) => new TreeNode(index, pf.name, pf.icon ? pf.icon : null)
            );
        } else {
            this.state.predefinedFilter = [];
            this.state.predefinedFilterList = [];
        }
        this.state.predefinedFilterPlaceholder = typeof input.predefinedFilterPlaceholder !== 'undefined'
            ? await TranslationService.translate(input.predefinedFilterPlaceholder)
            : await TranslationService.translate('Translatable#All Objects');

        const defaultPlaceholder = await TranslationService.translate('Translatable#Filter in list');
        this.state.placeholder = typeof input.placeholder !== 'undefined'
            ? await TranslationService.translate(input.placeholder)
            : defaultPlaceholder;

        this.state.icon = typeof input.icon !== 'undefined' ? input.icon : 'kix-icon-filter';
        this.state.showFilterCount = typeof input.showFilterCount !== 'undefined' ? input.showFilterCount : true;
        this.setFilterCount(input.filterCount);
    }

    private textFilterValueChanged(event: any): void {
        this.state.textFilterValue = event.target.value;
    }

    public predefinedFilterChanged(nodes: TreeNode[]): void {
        this.state.currentFilter = nodes && nodes.length ? nodes[0] : null;
        (this as any).setStateDirty('currentFilter');
        this.filter();
    }

    public keyDown(event: any): void {
        if (event.keyCode === 13 || event.key === 'Enter') {
            this.textFilterValueChanged(event);
            this.filter();
        }
    }

    public filter(): void {
        const filter = this.state.currentFilter ? this.state.predefinedFilter[this.state.currentFilter.id] : null;
        (this as any).emit('filter', this.state.textFilterValue, filter);
    }

    public reset(): void {
        this.state.textFilterValue = null;
        this.state.currentFilter = null;
    }

    private setFilterCount(filterCount: number = null) {
        if (typeof filterCount === 'number') {
            this.state.filterCountString = `(${filterCount})`;
        } else {
            this.state.filterCountString = '';
        }
    }
}

module.exports = Component;
