import { _decorator, Component, CCObject } from "cc";
import { EDITOR } from "cc/env";
import BaseLayout from "./BaseLayout";

const { ccclass, menu, property, executeInEditMode } = _decorator;
@ccclass
@executeInEditMode
@menu("Layout/LayoutElement")
export default class LayoutElement extends Component {
    @property
    private _ignoreLayout: boolean = false;
    @property
    private _minWidth: number = 0;
    @property
    private _minHeight: number = 0;
    @property
    private _preferredWidth: number = 0;
    @property
    private _preferredHeight: number = 0;
    @property
    private _flexibleWidth: number = 0;
    @property
    private _flexibleHeight: number = 0;

    @property({ tooltip: "ignore layout", displayOrder: 1 })
    public get ignoreLayout() { return this._ignoreLayout; }
    public set ignoreLayout(v) {
        if (this._ignoreLayout == v) return;
        this._ignoreLayout = v;
        this.layoutDirty();
        // if (EDITOR) v ? this._objFlags &= ~CCObject.Flags.IsSizeLocked : this._objFlags |= CCObject.Flags.IsSizeLocked;
    }

    @property({ tooltip: "ignore layout", displayOrder: 2 })
    public get minWidth() { return this._minWidth; }
    public set minWidth(v) {
        if (this._minWidth == v) return;
        this._minWidth = v;
        this.layoutDirty();
    }

    @property({ tooltip: "ignore layout", displayOrder: 3 })
    public get minHeight() { return this._minHeight; }
    public set minHeight(v) {
        if (this._minHeight == v) return;
        this._minHeight = v;
        this.layoutDirty();
    }

    @property({ tooltip: "ignore layout", displayOrder: 4 })
    public get preferredWidth() { return this._preferredWidth; }
    public set preferredWidth(v) {
        if (this._preferredWidth == v) return;
        this._preferredWidth = v;
        this.layoutDirty();
    }

    @property({ tooltip: "ignore layout", displayOrder: 5 })
    public get preferredHeight() { return this._preferredHeight; }
    public set preferredHeight(v) {
        if (this._preferredHeight == v) return;
        this._preferredHeight = v;
        this.layoutDirty();
    }

    @property({ tooltip: "ignore layout", displayOrder: 6 })
    public get flexibleWidth() { return this._flexibleWidth; }
    public set flexibleWidth(v) {
        if (this._flexibleWidth == v) return;
        this._flexibleWidth = v;
        this.layoutDirty();
    }

    @property({ tooltip: "ignore layout", displayOrder: 7 })
    public get flexibleHeight() { return this._flexibleHeight; }
    public set flexibleHeight(v) {
        if (this._flexibleHeight == v) return;
        this._flexibleHeight = v;
        this.layoutDirty();
    }

    public layoutDirty(): void {
        let layout: BaseLayout = this.node.parent?.getComponent(BaseLayout as any);
        layout?.layoutDirty();
    }

    // onEnable(): void {
    //     if (EDITOR) this._objFlags |= CCObject.Flags.IsSizeLocked;
    // }

    // onDisable(): void {
    //     if (EDITOR) this._objFlags &= ~CCObject.Flags.IsSizeLocked;
    // }
}