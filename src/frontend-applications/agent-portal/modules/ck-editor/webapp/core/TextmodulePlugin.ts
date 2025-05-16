/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { PlaceholderService } from '../../../base-components/webapp/core/PlaceholderService';
import { TextModule } from '../../../textmodule/model/TextModule';
import { TextModuleService } from '../../../textmodule/webapp/core';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { CKEditor5Configuration } from '../../model/CKEditor5Configuration';
import { CKEditor5 } from './CKEditor5';
import { CKEditor5Classes } from './CKEditor5Classes';

export class TextmodulePlugin {

    private static readonly VERTICAL_SPACING = 3;
    private static readonly MARKER = '::';

    public static setEditorConfig(editorConfig: CKEditor5Configuration): void {
        (editorConfig as any).textmodule = {
            loadTextmodules: this.getTextmoduleItems,
            prepareText: this.prepareTextmoduleText
        };
    }

    public static async getTextmoduleItems(searchText: string): Promise<Array<any>> {
        const textmodules = await TextModuleService.getInstance().searchTextModules(searchText);

        const result = [];
        for (const tm of textmodules) {
            const name = await TranslationService.translate(tm.Name);
            result.push({
                ID: tm.ID,
                Name: name,
                Keywords: tm.keywordsDisplayString
            });
        }

        return result.sort((a, b) => a.Name.localeCompare(b.Name));
    }

    public static async prepareTextmoduleText(textmoduleId: number): Promise<string> {
        const textmodules = await KIXObjectService.loadObjects<TextModule>(KIXObjectType.TEXT_MODULE, [textmoduleId])
            .catch((): TextModule[] => []);

        let text = textmoduleId?.toString();
        if (textmodules?.length) {
            text = await PlaceholderService.getInstance().replacePlaceholders(
                textmodules[0].Text, null, textmodules[0].Language, true
            );
        }
        return text;
    }

    public static getPlugin(): any {

        const Plugin = CKEditor5.getCKEditorClass(CKEditor5Classes.Plugin);
        const Command = CKEditor5.getCKEditorClass(CKEditor5Classes.Command);
        const keyCodes = CKEditor5.getCKEditorClass(CKEditor5Classes.keyCodes);
        const ListView = CKEditor5.getCKEditorClass(CKEditor5Classes.ListView);
        const ListItemView = CKEditor5.getCKEditorClass(CKEditor5Classes.ListItemView);
        const View = CKEditor5.getCKEditorClass(CKEditor5Classes.View);
        const ContextualBalloon = CKEditor5.getCKEditorClass(CKEditor5Classes.ContextualBalloon);
        const Collection = CKEditor5.getCKEditorClass(CKEditor5Classes.Collection);
        const logWarning = CKEditor5.getCKEditorClass(CKEditor5Classes.logWarning);
        const clickOutsideHandler = CKEditor5.getCKEditorClass(CKEditor5Classes.clickOutsideHandler);
        const TextWatcher = CKEditor5.getCKEditorClass(CKEditor5Classes.TextWatcher);
        const Rect = CKEditor5.getCKEditorClass(CKEditor5Classes.Rect);

        class Textmodule extends Plugin {
            static get requires(): any {
                return [TextmoduleEditing, TextmoduleUI];
            }
        }

        class TextmoduleEditing extends Plugin {

            public init(): void {
                const editor = this.editor;
                const model = editor.model;

                model.schema.extend('$text', { allowAttributes: 'textmodule' });
                editor.commands.add('textmodule', new TextmoduleCommand(editor));
            }
        }

        class TextmoduleCommand extends Command {

            constructor(editor) {
                super(editor);
                this._isEnabledBasedOnSelection = false;
            }

            public refresh(): void {
                const model = this.editor.model;
                const doc = model.document;
                this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, 'textmodule');
            }

            public async execute(options): Promise<void> {
                const model = this.editor.model;
                const document = model.document;
                const selection = document.selection;

                const range = options.range || selection.getFirstRange();
                if (!model.canEditAt(range)) {
                    return;
                }

                const prepareText = this.editor.config.get('textmodule.prepareText');
                const text = await prepareText(options.textmodule.ID);

                model.change((writer) => {
                    const viewFragment = this.editor.data.processor.toView(text);
                    const modelFragment = this.editor.data.toModel(viewFragment);

                    const insertionRange = model.insertContent(modelFragment, range);

                    if (insertionRange) {
                        const newPosition = insertionRange.end;
                        writer.setSelection(newPosition);
                    }
                });
            }

        }

        class TextmoduleUI extends Plugin {

            private _textmoduleView;
            private _balloon;
            private _items;
            private _lastRequested;

            private defaultHandledKeyCodes: any[] = [];

            private defaultCommitKeyCodes: any[] = [];

            private readonly MARKER = '::';

            constructor(editor) {
                super(editor);

                this._items = new Collection();

                this.defaultHandledKeyCodes = [
                    keyCodes.arrowup,
                    keyCodes.arrowdown,
                    keyCodes.esc
                ];

                this.defaultCommitKeyCodes = [
                    keyCodes.enter,
                    keyCodes.tab
                ];

                this._textmoduleView = this._createTextmoduleView();

                editor.config.define('textmodule', { feeds: [] });
            }


            public init(): void {
                const editor = this.editor;

                const commitKeys = this.defaultCommitKeyCodes;
                const handledKeyCodes = this.defaultHandledKeyCodes.concat(commitKeys);

                this._balloon = editor.plugins.get(ContextualBalloon);

                editor.editing.view.document.on('keydown', (evt, data) => {
                    if (isHandledKey(data.keyCode) && this._isUIVisible()) {
                        data.preventDefault();
                        evt.stop(); // Required for Enter key overriding.

                        if (data.keyCode === keyCodes.arrowdown) {
                            this._textmoduleView.selectNext();
                        }

                        if (data.keyCode === keyCodes.arrowup) {
                            this._textmoduleView.selectPrevious();
                        }

                        if (commitKeys.includes(data.keyCode)) {
                            this._textmoduleView.executeSelected();
                        }

                        if (data.keyCode === keyCodes.esc) {
                            this._hideUIAndRemoveMarker();
                        }
                    }
                }, { priority: 'highest' }); // Required to override the Enter key.

                // Close the dropdown upon clicking outside of the plugin UI.
                clickOutsideHandler({
                    emitter: this._textmoduleView,
                    activator: () => this._isUIVisible(),
                    contextElements: () => [this._balloon.view.element],
                    callback: () => this._hideUIAndRemoveMarker()
                });

                this._setupTextWatcher();
                this.listenTo(editor, 'change:isReadOnly', () => {
                    this._hideUIAndRemoveMarker();
                });
                this.on('requestTextmodule:response', (evt, data) => this._handleTextmoduleResponse(data));
                this.on('requestTextmodule:error', () => this._hideUIAndRemoveMarker());

                function isHandledKey(keyCode): boolean {
                    return handledKeyCodes.includes(keyCode);
                }
            }

            public destroy(): void {
                super.destroy();
                this._textmoduleView.destroy();
            }

            private _isUIVisible(): boolean {
                return this._balloon?.visibleView === this._textmoduleView;
            }

            private _createTextmoduleView(): any {
                const locale = this.editor.locale;

                const textmoduleView = new TextmoduleView(locale);

                textmoduleView.items.bindTo(this._items).using((data) => {
                    const { textmodule, marker } = data;

                    const dropdownLimit = 10;

                    if (textmoduleView.items.length >= dropdownLimit) {
                        return null;
                    }

                    const listItemView = new TextmoduleListItemView(locale);

                    const view = this._renderItem(textmodule);
                    view.delegate('execute').to(listItemView);

                    listItemView.children.add(view);
                    listItemView.item = textmodule;
                    listItemView.marker = marker;

                    listItemView.on('execute', () => {
                        textmoduleView.fire('execute', {
                            textmodule,
                            marker
                        });
                    });

                    return listItemView;
                });

                textmoduleView.on('execute', (evt, data) => {
                    const editor = this.editor;
                    const model = editor.model;

                    const marker = data.marker;

                    const textmoduleMarker = editor.model.markers.get('textmodule');

                    if (textmoduleMarker) {
                        // Create a range on matched text.
                        const end = model.createPositionAt(model.document.selection.focus);
                        const start = model.createPositionAt(textmoduleMarker.getStart());
                        const range = model.createRange(start, end);

                        this._hideUIAndRemoveMarker();

                        editor.execute('textmodule', {
                            textmodule: data.textmodule,
                            marker,
                            range
                        });
                    }

                    editor.editing.view.focus();
                });

                return textmoduleView;
            }

            private _requestTextmodules(marker, searchText): void {
                this._lastRequested = searchText;

                const loadTextmodules = this.editor.config.get('textmodule.loadTextmodules');

                if (loadTextmodules) {
                    loadTextmodules(searchText).then((response) => {
                        if (this._lastRequested === searchText) {
                            this.fire('requestTextmodule:response', { textmodules: response, marker });
                        } else {
                            this.fire('requestTextmodule:discarded', { textmodules: response, marker });
                        }
                    }).catch((error) => {
                        this.fire('requestTextmodule:error', { error });
                        logWarning('textmodule-callback-error', { marker, error });
                        console.error(error);
                    });
                }
            }

            private _setupTextWatcher(): void {
                const editor = this.editor;

                const watcher = new TextWatcher(editor.model, this.createTestCallback());

                watcher.on('matched', (evt, data) => {
                    const markerDefinition = TextmodulePlugin.getLastValidMarkerInText(data.text);
                    const selection = editor.model.document.selection;
                    const focus = selection.focus;
                    const markerPosition = editor.model.createPositionAt(focus.parent, markerDefinition.position);

                    if (
                        TextmodulePlugin.isPositionInExistingTextmodule(focus) ||
                        TextmodulePlugin.isMarkerInExistingTextmodule(markerPosition)
                    ) {
                        this._hideUIAndRemoveMarker();
                        return;
                    }

                    const feedText = TextmodulePlugin.requestSearchText(markerDefinition, data.text);
                    const matchedTextLength = markerDefinition.marker.length + feedText.length;

                    // Create a marker range.
                    const start = focus.getShiftedBy(-matchedTextLength);
                    const end = focus.getShiftedBy(-feedText.length);
                    const markerRange = editor.model.createRange(start, end);

                    if (TextmodulePlugin.checkIfStillInCompletionMode(editor)) {
                        const textmoduleMarker = editor.model.markers.get('textmodule');

                        editor.model.change((writer) => {
                            writer.updateMarker(textmoduleMarker, { range: markerRange });
                        });
                    } else {
                        editor.model.change((writer) => {
                            writer.addMarker(
                                'textmodule',
                                { range: markerRange, usingOperation: false, affectsData: false }
                            );
                        });
                    }

                    this._requestTextmodules(markerDefinition.marker, feedText);
                });

                watcher.on('unmatched', () => {
                    this._hideUIAndRemoveMarker();
                });

                const textmoduleCommand = editor.commands.get('textmodule');
                watcher.bind('isEnabled').to(textmoduleCommand);

                return watcher;
            }

            private _handleTextmoduleResponse(data): void {
                const { textmodules, marker } = data;

                if (!TextmodulePlugin.checkIfStillInCompletionMode(this.editor)) {
                    return;
                }

                this._items.clear();

                for (const textmodule of textmodules) {
                    this._items.add({ textmodule, marker });
                }

                const textmoduleMarker = this.editor.model.markers.get('textmodule');

                if (this._items.length) {
                    this._showOrUpdateUI(textmoduleMarker);
                } else {
                    this._hideUIAndRemoveMarker();
                }
            }

            private _showOrUpdateUI(markerMarker): void {
                if (!this._textmoduleView) {
                    return;
                }
                try {
                    if (this._isUIVisible()) {
                        this._balloon.updatePosition(
                            this._getBalloonPanelPositionData(markerMarker, this._textmoduleView.position)
                        );
                    } else {
                        this._balloon.add({
                            view: this._textmoduleView,
                            position: this._getBalloonPanelPositionData(markerMarker, this._textmoduleView.position),
                            singleViewMode: true
                        });
                    }

                    this._textmoduleView.position = this._balloon.view.position;
                    this._textmoduleView.selectFirst();
                } catch (e) {
                    console.warn('Textmodule Plugin: Could not update UI.');
                    console.warn(e);
                }
            }

            private _hideUIAndRemoveMarker(): void {
                try {
                    if (this._balloon.hasView(this._textmoduleView)) {
                        this._balloon.remove(this._textmoduleView);
                    }

                    if (TextmodulePlugin.checkIfStillInCompletionMode(this.editor)) {
                        this.editor.model.change((writer) => writer.removeMarker('textmodule'));
                    }

                    this._textmoduleView.position = undefined;
                } catch (e) {
                    console.warn('Textmodule Plugin: Could not remove marker.');
                    console.warn(e);
                }
            }

            private _renderItem(textmodule): any {
                const renderResult = this.textmoduleItemRenderer(textmodule);
                return new DomWrapperView(this.editor.locale, renderResult);;
            }

            private textmoduleItemRenderer(textmodule): any {
                const container = document.createElement('div');
                container.classList.add('py-1');
                container.id = `textmodule-list-item-id-${textmodule.ID}`;

                const nameElement = document.createElement('div');
                nameElement.classList.add('fw-bold');
                nameElement.textContent = textmodule.Name;

                const keywordsElement = document.createElement('div');
                keywordsElement.classList.add('fst-italic');
                keywordsElement.textContent = textmodule.Keywords;

                container.appendChild(nameElement);
                container.appendChild(keywordsElement);

                return container;
            }

            private _getBalloonPanelPositionData(textmoduleMarker, preferredPosition): any {
                const editor = this.editor;
                const editing = editor.editing;
                const domConverter = editing.view.domConverter;
                const mapper = editing.mapper;
                const uiLanguageDirection = editor.locale.uiLanguageDirection;

                return {
                    target: (): any => {
                        let modelRange = textmoduleMarker.getRange();
                        if (modelRange.start.root.rootName === '$graveyard') {
                            modelRange = editor.model.document.selection.getFirstRange();
                        }

                        const viewRange = mapper.toViewRange(modelRange);
                        const rangeRects = Rect.getDomRangeRects(domConverter.viewRangeToDom(viewRange));

                        return rangeRects.pop();
                    },
                    limiter: (): any => {
                        const view = this.editor.editing.view;
                        const viewDocument = view.document;
                        const editableElement = viewDocument.selection.editableElement;

                        if (editableElement) {
                            return view.domConverter.mapViewToDom(editableElement.root);
                        }

                        return null;
                    },
                    positions: TextmodulePlugin.getBalloonPanelPositions(preferredPosition, uiLanguageDirection)
                };
            }

            private createTestCallback(): (text) => boolean {
                const textMatcher = (text): boolean => {

                    const markerIndex = this._getMarkerIndex(text);

                    if (markerIndex < 0) {
                        return false;
                    }

                    let splitStrinFrom = markerIndex !== 0 ? markerIndex : 0;
                    const textToTest = text.substring(splitStrinFrom);
                    return textToTest.startsWith(this.MARKER);
                };

                return textMatcher;
            }

            private _getMarkerIndex(text): number {
                return text.lastIndexOf(this.MARKER);
            }
        }

        class TextmoduleView extends ListView {

            selected;
            position;

            constructor(locale) {
                super(locale);
            }

            public selectFirst(): void {
                this.select(0);
            }

            public selectNext(): void {
                const item = this.selected;
                const index = this.items.getIndex(item);
                this.select(index + 1);
            }

            public selectPrevious(): void {
                const item = this.selected;
                const index = this.items.getIndex(item);
                this.select(index - 1);
            }

            public select(index): void {
                let indexToGet = 0;

                if (index > 0 && index < this.items.length) {
                    indexToGet = index;
                } else if (index < 0) {
                    indexToGet = this.items.length - 1;
                }

                const item = this.items.get(indexToGet);

                if (this.selected === item) {
                    return;
                }

                if (this.selected) {
                    this.selected.removeHighlight();
                }

                item.highlight();
                this.selected = item;

                if (this.element && !this._isItemVisibleInScrolledArea(item)) {
                    this.element.scrollTop = item.element.offsetTop;
                }
            }

            public executeSelected(): void {
                this.selected?.fire('execute');
            }

            private _isItemVisibleInScrolledArea(item): any {
                return new Rect(this.element).contains(new Rect(item.element));
            }
        }

        class TextmoduleListItemView extends ListItemView {

            item;
            marker;

            public constructor(locale) {
                super(locale);
            }

            public highlight(): void {
                const child = this.children.first;
                child.isOn = true;
            }

            public removeHighlight(): void {
                const child = this.children.first;
                child.isOn = false;
            }

        }

        class DomWrapperView extends View {

            domElement;

            constructor(locale, domElement) {
                super(locale);

                // Disable template rendering on this view.
                this.template = undefined;

                this.domElement = domElement;

                // Render dom wrapper as a button.
                this.domElement.classList.add('ck-button');

                this.set('isOn', false);

                // Handle isOn state as in buttons.
                this.on('change:isOn', (evt, name, isOn) => {
                    if (isOn) {
                        this.domElement.classList.add('ck-on');
                        this.domElement.classList.remove('ck-off');
                    } else {
                        this.domElement.classList.add('ck-off');
                        this.domElement.classList.remove('ck-on');
                    }
                });

                // Pass click event as execute event.
                this.listenTo(this.domElement, 'click', () => {
                    this.fire('execute');
                });
            }

            public render(): void {
                super.render();

                this.element = this.domElement;
            }

            public focus(): void {
                this.domElement.focus();
            }
        }

        return Textmodule;
    }

    private static getBalloonPanelPositions(preferredPosition, uiLanguageDirection): any {
        const positions = {
            'caret_se': (targetRect): any => {
                return {
                    top: targetRect.bottom + this.VERTICAL_SPACING,
                    left: targetRect.right,
                    name: 'caret_se',
                    config: {
                        withArrow: false
                    }
                };
            },

            'caret_ne': (targetRect, balloonRect): any => {
                return {
                    top: targetRect.top - balloonRect.height - this.VERTICAL_SPACING,
                    left: targetRect.right,
                    name: 'caret_ne',
                    config: {
                        withArrow: false
                    }
                };
            },

            'caret_sw': (targetRect, balloonRect): any => {
                return {
                    top: targetRect.bottom + this.VERTICAL_SPACING,
                    left: targetRect.right - balloonRect.width,
                    name: 'caret_sw',
                    config: {
                        withArrow: false
                    }
                };
            },

            'caret_nw': (targetRect, balloonRect): any => {
                return {
                    top: targetRect.top - balloonRect.height - this.VERTICAL_SPACING,
                    left: targetRect.right - balloonRect.width,
                    name: 'caret_nw',
                    config: {
                        withArrow: false
                    }
                };
            }
        };

        if (Object.prototype.hasOwnProperty.call(positions, preferredPosition)) {
            return [
                positions[preferredPosition]
            ];
        }

        return uiLanguageDirection !== 'rtl' ? [
            positions.caret_se,
            positions.caret_sw,
            positions.caret_ne,
            positions.caret_nw
        ] : [
            positions.caret_sw,
            positions.caret_se,
            positions.caret_nw,
            positions.caret_ne
        ];
    }

    private static getLastValidMarkerInText(text): any {
        let lastValidMarker;

        const currentMarkerLastIndex = text.lastIndexOf(this.MARKER);

        if (!lastValidMarker || currentMarkerLastIndex >= lastValidMarker.position) {
            lastValidMarker = {
                marker: this.MARKER,
                position: currentMarkerLastIndex + 1,
                minimumCharacters: 0,
                pattern: this.createRegExp(this.MARKER, 0)
            };
        }

        return lastValidMarker;
    }

    private static createRegExp(marker, minimumCharacters): any {
        const numberOfCharacters = minimumCharacters === 0 ? '*' : `{${minimumCharacters},}`;

        const env = CKEditor5.getCKEditorClass(CKEditor5Classes.env);
        const openAfterCharacters = env.features.isRegExpUnicodePropertySupported ? '\\p{Ps}\\p{Pi}"\'' : '\\(\\[{"\'';
        const textmoduleCharacters = '.';
        marker = marker.replace(/[.*+?^${}()\-|[\]\\]/g, '\\$&');
        const pattern = `(?:^|[ ${openAfterCharacters}])([${marker}])(${textmoduleCharacters}${numberOfCharacters})$`;
        return new RegExp(pattern, 'u');
    }

    private static requestSearchText(markerDefinition, text): any {
        let splitStringFrom = 0;

        if (markerDefinition.position !== 0) {
            splitStringFrom = markerDefinition.position;
        }

        const regExp = this.createRegExp(markerDefinition.marker, 0);
        const textToMatch = text.substring(splitStringFrom);
        const match = textToMatch.match(regExp);

        return match[2];
    }

    private static isPositionInExistingTextmodule(position): any {
        const hasTextmodule = position.textNode && position.textNode.hasAttribute('textmodule');
        const nodeBefore = position.nodeBefore;
        return hasTextmodule || nodeBefore && nodeBefore.is('$text') && nodeBefore.hasAttribute('textmodule');
    }

    private static isMarkerInExistingTextmodule(markerPosition): any {
        const nodeAfter = markerPosition.nodeAfter;
        return nodeAfter && nodeAfter.is('$text') && nodeAfter.hasAttribute('textmodule');
    }

    private static checkIfStillInCompletionMode(editor): any {
        return editor.model.markers.has('textmodule');
    }

}
