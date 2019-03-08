import { ObjectIcon } from "../../../../../core/model";
import { IColumn } from "../../../../../core/browser";

export class ComponentState {

    public loading: boolean = true;
    public column: IColumn = null;
    public icon: string | ObjectIcon = null;
    public title: string = '';
    public size: number = 100;
    public isSorted: boolean = false;
    public sortOrderDown: boolean = false;
    public resizeActive: boolean = false;
    public filterHovered: boolean = false;
    public filterIsShown: boolean = false;

}
