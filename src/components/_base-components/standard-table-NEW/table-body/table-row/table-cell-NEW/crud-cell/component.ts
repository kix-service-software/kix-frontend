import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, ICell, LabelService } from '../../../../../../../core/browser';
import { PermissionProperty, CRUD, Permission, KIXObjectType } from '../../../../../../../core/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const cell: ICell = input.cell;
        if (cell) {
            const property = cell.getProperty();

            const permission: Permission = cell.getRow().getRowObject().getObject();
            const value: number = permission.Value;

            switch (property) {
                case PermissionProperty.CREATE:
                    this.prepareState(value, CRUD.CREATE, 'C');
                    break;
                case PermissionProperty.READ:
                    this.prepareState(value, CRUD.READ, 'R');
                    break;
                case PermissionProperty.UPDATE:
                    this.prepareState(value, CRUD.UPDATE, 'U');
                    break;
                case PermissionProperty.DELETE:
                    this.prepareState(value, CRUD.DELETE, 'D');
                    break;
                case PermissionProperty.DENY:
                    this.prepareState(value, CRUD.DENY, 'DN');
                    this.state.deny = true;
                    break;
                default:
            }
            this.update(property);
        }

    }

    private async update(property: string): Promise<void> {
        this.state.tooltip = await LabelService.getInstance().getPropertyText(
            property, KIXObjectType.PERMISSION
        );
    }

    private prepareState(value: number, crud: CRUD, optionText: string): void {
        if (value & crud) {
            this.state.active = true;
        }
        this.state.optionText = optionText;
    }

}

module.exports = Component;
