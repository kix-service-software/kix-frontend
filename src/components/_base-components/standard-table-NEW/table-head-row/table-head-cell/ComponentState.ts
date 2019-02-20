import { ObjectIcon } from "../../../../../core/model";

export class ComponentState {

    public loading: boolean = true;
    public icon: string | ObjectIcon = null;
    public title: string = '';
    public size: number = 100;
    public isSorted: boolean = false;
    public sortOrderDown: boolean = false;
    public resizeActive: boolean = false;
    public filterHovered: boolean = false;
    public filterIsShown: boolean = false;

}
