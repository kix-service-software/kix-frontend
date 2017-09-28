import { WidgetState } from './WidgetState';
import { WidgetAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class WidgetActionHandler {

    public handleWidgetAction(state: WidgetState, action): WidgetState {
        switch (action.type) {

            case WidgetAction.WIDGET_INITIALIZE + FULFILLED:
                return { ...state, socketlListener: action.payload.socketListener };

            case WidgetAction.WIDGET_LOADED + FULFILLED:
                return {
                    ...state,
                    template: action.payload.template,
                    configurationTemplate: action.payload.configurationTemplate,
                    configuration: action.payload.configuration
                };

            case WidgetAction.WIDGET_ERROR + FULFILLED:
                return { ...state, error: action.payload.error };

            default:
                return { ...state };
        }
    }
}

const widgetActionHandler = new WidgetActionHandler();

export default (state, action) => {
    state = state || new WidgetState();

    return widgetActionHandler.handleWidgetAction(state, action);
};
