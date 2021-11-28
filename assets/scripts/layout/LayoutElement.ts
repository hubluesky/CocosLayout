import { _decorator, Component } from "cc";
import BaseLayout from "./BaseLayout";

const { ccclass, menu, property } = _decorator;
@ccclass
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
    public set ignoreLayout(v) { this._ignoreLayout = v; this.layoutDirty(); }

    @property({ tooltip: "ignore layout", displayOrder: 2 })
    public get minWidth() { return this._minWidth; }
    public set minWidth(v) { this._minWidth = v; this.layoutDirty(); }

    @property({ tooltip: "ignore layout", displayOrder: 3 })
    public get minHeight() { return this._minHeight; }
    public set minHeight(v) { this._minHeight = v; this.layoutDirty(); }

    @property({ tooltip: "ignore layout", displayOrder: 4 })
    public get preferredWidth() { return this._preferredWidth; }
    public set preferredWidth(v) { this._preferredWidth = v; this.layoutDirty(); }

    @property({ tooltip: "ignore layout", displayOrder: 5 })
    public get preferredHeight() { return this._preferredHeight; }
    public set preferredHeight(v) { this._preferredHeight = v; this.layoutDirty(); }

    @property({ tooltip: "ignore layout", displayOrder: 6 })
    public get flexibleWidth() { return this._flexibleWidth; }
    public set flexibleWidth(v) { this._flexibleWidth = v; this.layoutDirty(); }

    @property({ tooltip: "ignore layout", displayOrder: 7 })
    public get flexibleHeight() { return this._flexibleHeight; }
    public set flexibleHeight(v) { this._flexibleHeight = v; this.layoutDirty(); }

    public layoutDirty(): void {
        let layout = this.node.parent?.getComponent("BaseLayout") as BaseLayout;
        layout?.layoutDirty();
    }
}