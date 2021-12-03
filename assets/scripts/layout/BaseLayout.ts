import { CCFloat, Component, director, Director, Enum, Node, size, UITransform, Vec2, _decorator } from "cc";
import LayoutElement from "./LayoutElement";

const { ccclass, property, executeInEditMode } = _decorator;

interface SetPositionEvent {
    (uiTransform: UITransform, x: number, height: number): void;
}

interface OnForeachChildren {
    (uiTransform: UITransform, element: LayoutElement): void;
}

interface GetChildSize {
    (child: UITransform, element: LayoutElement, totalSize: number, size: number): number;
}

interface GetChildSize2 {
    (child: UITransform, element: LayoutElement): number;
}


export enum LayoutAlignment {
    /** 正向排序 */
    Forward,
    /** 逆向排序 */
    Backward,
    /** 居中排序 */
    Center,
    /** 填充 */
    Full,
    /** 按子大小自动计算内容大小 */
    Content,
}

@executeInEditMode
export default abstract class BaseLayout extends Component {
    @property
    private _top: number = 0;
    @property
    private _bottom: number = 0;
    @property
    private _left: number = 0;
    @property
    private _right: number = 0;
    @property
    private _spacing: number = 0;
    @property
    private _childScaleWidth: boolean = false;
    @property
    private _childScaleHeight: boolean = false;
    @property
    private _reverse: boolean = false;
    @property
    private _horizontalAlignment: LayoutAlignment = LayoutAlignment.Center;
    @property
    private _verticalAlignment: LayoutAlignment = LayoutAlignment.Center;

    @property({ type: Enum(LayoutAlignment), displayOrder: 1, tooltip: "水平对齐方式" })
    public get horizontalAlignment() { return this._horizontalAlignment; }
    public set horizontalAlignment(v) {
        if (this._horizontalAlignment == v) return;
        this._horizontalAlignment = v;
        this.layoutDirty();
    }

    @property({ type: Enum(LayoutAlignment), displayOrder: 1, tooltip: "垂直对齐方式" })
    public get verticalAlignment() { return this._verticalAlignment; }
    public set verticalAlignment(v) {
        if (this._verticalAlignment == v) return;
        this._verticalAlignment = v;
        this.layoutDirty();
    }

    @property({ group: { name: "padding", displayOrder: 0 }, displayOrder: 0, tooltip: "容器的边距" })
    public get top() { return this._top; }
    public set top(v) {
        if (this._top == v) return;
        this._top = v;
        this.layoutDirty();
    }

    @property({ group: { name: "padding" }, tooltip: "容器的边距" })
    public get bottom() { return this._bottom; }
    public set bottom(v) {
        if (this._bottom == v) return;
        this._bottom = v;
        this.layoutDirty();
    }

    @property({ group: { name: "padding" }, tooltip: "容器的边距" })
    public get left() { return this._left; }
    public set left(v) {
        if (this._left == v) return;
        this._left = v;
        this.layoutDirty();
    }

    @property({ group: { name: "padding" }, tooltip: "容器的边距" })
    public get right() { return this._right; }
    public set right(v) {
        if (this._right == v) return;
        this._right = v;
        this.layoutDirty();
    }

    @property({ type: CCFloat, tooltip: "子节点之间的间距" })
    public get spacing() { return this._spacing; }
    public set spacing(v) {
        if (this._spacing == v) return;
        this._spacing = v;
        this.layoutDirty();
    }

    @property({ tooltip: "子节点倒过来排序" })
    public get reverse() { return this._reverse; };
    public set reverse(v) {
        if (this._reverse == v) return;
        this._reverse = v;
        this.foreachChildren = this.getForeachChildren(v);
        this.layoutDirty();
    }

    @property({ tooltip: "计算子节点的宽度缩放" })
    public get childScaleWidth() { return this._childScaleWidth; };
    public set childScaleWidth(v) {
        if (this._childScaleWidth == v) return;
        this._childScaleWidth = v;
        this.layoutDirty();
    }

    @property({ tooltip: "计算子节点的高度缩放" })
    public get childScaleHeight() { return this._childScaleHeight; };
    public set childScaleHeight(v) {
        if (this._childScaleHeight == v) return;
        this._childScaleHeight = v;
        this.layoutDirty();
    }

    private isDirty: boolean = false;
    private uiTransform: UITransform;
    protected foreachChildren: (callback: OnForeachChildren) => void;

    onLoad(): void {
        this.uiTransform = this.node.getComponent(UITransform);
    }

    onEnable(): void {
        this.foreachChildren = this.getForeachChildren(this.reverse);
        this.addEventListeners();
        this.layoutDirty();
    }

    onDisable(): void {
        this.removeEventListeners();
    }

    protected getForeachChildren(reverse: boolean): (callback: OnForeachChildren) => void {
        let callChildFunc = (child: UITransform, callback: OnForeachChildren) => {
            let element = child.getComponent(LayoutElement);
            if (!child.node.active || element != null && element.enabled && element.ignoreLayout) return;
            callback(child, element);
        };
        if (reverse) {
            return (callback: OnForeachChildren) => {
                for (let i = this.node.children.length - 1; i >= 0; i--) {
                    callChildFunc(this.node.children[i].getComponent(UITransform), callback);
                }
            };
        } else {
            return (callback: OnForeachChildren) => {
                for (let i = 0; i < this.node.children.length; i++) {
                    callChildFunc(this.node.children[i].getComponent(UITransform), callback);
                }
            };
        }
    }

    protected addEventListeners(): void {
        director.on(Director.EVENT_AFTER_UPDATE, this.doLayout, this);
        this.node.on(Node.EventType.SIZE_CHANGED, this.onResizeChanged, this);
        this.node.on(Node.EventType.ANCHOR_CHANGED, this.layoutDirty, this);
        this.node.on(Node.EventType.CHILD_ADDED, this.onChildAdded, this);
        this.node.on(Node.EventType.CHILD_REMOVED, this.onChildRemoved, this);
        this.node.on('childrenSiblingOrderChanged', this.doLayout, this);
        this.addChildrenEventListeners();
    }

    protected removeEventListeners(): void {
        director.off(Director.EVENT_AFTER_UPDATE, this.doLayout, this);
        this.node.off(Node.EventType.SIZE_CHANGED, this.onResizeChanged, this);
        this.node.off(Node.EventType.ANCHOR_CHANGED, this.layoutDirty, this);
        this.node.off(Node.EventType.CHILD_ADDED, this.onChildAdded, this);
        this.node.off(Node.EventType.CHILD_REMOVED, this.onChildRemoved, this);
        this.node.off('childrenSiblingOrderChanged', this.doLayout, this);
        this.removeChildrenEventListeners();
    }

    protected addChildrenEventListeners(): void {
        for (let child of this.node.children)
            this.addChildEventListeners(child);
    }

    protected removeChildrenEventListeners(): void {
        for (let child of this.node.children)
            this.removeChildEventListeners(child);
    }

    protected addChildEventListeners(child: Node): void {
        // child.on(Node.EventType.SCALE_CHANGED, this.LayoutDirty, this);
        child.on(Node.EventType.SIZE_CHANGED, this.layoutDirty, this);
        child.on(Node.EventType.TRANSFORM_CHANGED, this.layoutDirty, this);
        child.on(Node.EventType.ANCHOR_CHANGED, this.layoutDirty, this);
        child.on('active-in-hierarchy-changed', this.layoutDirty, this);
    }

    protected removeChildEventListeners(child: Node): void {
        // child.off(Node.EventType.SCALE_CHANGED, this.LayoutDirty, this);
        child.off(Node.EventType.SIZE_CHANGED, this.layoutDirty, this);
        child.off(Node.EventType.TRANSFORM_CHANGED, this.layoutDirty, this);
        child.off(Node.EventType.ANCHOR_CHANGED, this.layoutDirty, this);
        child.off('active-in-hierarchy-changed', this.layoutDirty, this);
    }

    protected onChildAdded(child: Node): void {
        this.addChildEventListeners(child);
    }

    protected onChildRemoved(child: Node): void {
        this.removeChildEventListeners(child);
    }

    protected onResizeChanged(): void {
        this.layoutDirty();
    }

    public layoutDirty(): void {
        this.isDirty = true;
    }

    public doLayout(): void {
        if (!this.isDirty || this.node.children.length <= 0) return;
        this.forceDoLayout();
    }

    protected abstract get layoutType(): LayoutAlignment;
    protected abstract get alignment(): LayoutAlignment;
    protected abstract get sign(): number;
    protected abstract getNodeAnchor(uiTransform: UITransform): Vec2;
    protected abstract getMargins(): Vec2[];
    protected abstract setNodePosition(uiTransform: UITransform, x: number, y: number): void;
    protected abstract getLayoutSize(uiTransform: UITransform): number;
    protected abstract setLayoutSize(uiTransform: UITransform, w: number): void;
    protected abstract getNoLayoutSize(uiTransform: UITransform): number;
    protected abstract setNoLayoutSize(uiTransform: UITransform, h: number): void;
    protected abstract getLayoutAnchor(uiTransform: UITransform): number;
    protected abstract getNoLayoutAnchor(uiTransform: UITransform): number;
    protected abstract getElementMinSize(uiTransform: UITransform, element: LayoutElement): number;
    protected abstract getElementPreferredSize(uiTransform: UITransform, element: LayoutElement): number;
    protected abstract getElementFlexibleSize(element: LayoutElement): number;

    public forceDoLayout(): void {
        const margins = this.getMargins();
        const contentSize = this.getLayoutSize(this.uiTransform);
        const anchor = this.getNodeAnchor(this.uiTransform);
        const outHeight = { maxHeight: 0 };
        const alignmentFunc = this.getAlignmentFunction(anchor.y, margins[1], outHeight);

        let result = this.getChildrenSizes();
        let getChildFunc: GetChildSize2;
        let allMargin = margins[0].x + margins[0].y;
        if (result.totalPreferredSize + allMargin <= contentSize) {
            getChildFunc = this.getChildSize(this.getChildElementPreferredSize, result.flexibleSize, contentSize - result.totalPreferredSize - allMargin);
        } else {
            getChildFunc = this.getChildSize(this.getChildElementMinSize, result.shrinkSize, contentSize - result.totalMinSize - allMargin);
        }

        switch (this.layoutType) {
            case LayoutAlignment.Forward:
                this.layoutChildiren(-contentSize * anchor.x + margins[0].x, getChildFunc, alignmentFunc);
                break;
            case LayoutAlignment.Backward:
                this.layoutChildirenBack(contentSize * (1 - anchor.x) - margins[0].y, getChildFunc, alignmentFunc);
                break;
            case LayoutAlignment.Center:
                if (result.flexibleSize > 0)
                    this.layoutChildiren(-contentSize * anchor.x + margins[0].x, getChildFunc, alignmentFunc);
                else
                    this.layoutCenter(contentSize * (anchor.x - 0.5) - margins[0].x + margins[0].y, getChildFunc, alignmentFunc);
                break;
            case LayoutAlignment.Full:
                this.layoutFull(margins[0], contentSize, anchor, alignmentFunc);
                break;
            case LayoutAlignment.Content:
                this.layoutContent(margins[0], anchor, this.getLayoutSize.bind(this), alignmentFunc);
                break;
        }

        if (this.alignment == LayoutAlignment.Content)
            this.setNoLayoutSize(this.uiTransform, outHeight.maxHeight + margins[1].x + margins[1].y);
        this.isDirty = false;
    }

    protected getAlignmentFunction(anchor: number, margin: Vec2, outHeight: { maxHeight: number }): SetPositionEvent {
        return (uiTransform: UITransform, offset: number, childSize: number) => {
            let contentSize = this.getNoLayoutSize(this.uiTransform);
            let childAnchor = this.getNoLayoutAnchor(uiTransform);

            switch (this.alignment) {
                case LayoutAlignment.Forward:
                    this.setNodePosition(uiTransform, offset, -contentSize * anchor + childAnchor * childSize + margin.y);
                    break;
                case LayoutAlignment.Backward:
                    this.setNodePosition(uiTransform, offset, contentSize * (1 - anchor) - (1 - childAnchor) * childSize - margin.x);
                    break;
                case LayoutAlignment.Center:
                    this.setNodePosition(uiTransform, offset, -contentSize * (anchor - 0.5) - (0.5 - childAnchor) * childSize + margin.x + margin.y);
                    break;
                case LayoutAlignment.Full:
                    childSize = contentSize - margin.x - margin.y;
                    this.setNoLayoutSize(uiTransform, childSize);
                    this.setNodePosition(uiTransform, offset, contentSize * (1 - anchor) - (1 - childAnchor) * childSize - margin.x);
                    break;
                case LayoutAlignment.Content:
                    this.setNodePosition(uiTransform, offset, contentSize * (1 - anchor) - (1 - childAnchor) * childSize - margin.x);
                    outHeight.maxHeight = Math.max(outHeight.maxHeight, childSize);
                    break;
            }
        }
    }

    private getChildSize(getSize: GetChildSize, totalSize: number, size: number): GetChildSize2 {
        return (child: UITransform, element: LayoutElement) => getSize.call(this, child, element, totalSize, size);
    }

    private getChildrenSizes(): { totalMinSize: number, totalPreferredSize: number, shrinkSize: number, flexibleSize: number } {
        let totalMinSize: number = 0, totalPreferredSize: number = 0, shrinkSize: number = 0, flexibleSize: number = 0;
        let count = 0;
        this.foreachChildren((child, element) => {
            count++;
            if (element == null) {
                let nodeSize = this.getLayoutSize(child);
                totalMinSize += nodeSize;
                totalPreferredSize += nodeSize;
            } else {
                let min = this.getElementMinSize(child, element);
                let preferred = this.getElementPreferredSize(child, element);
                let flexible = this.getElementFlexibleSize(element);
                totalMinSize += min;
                totalPreferredSize += preferred;
                shrinkSize += preferred - min;
                flexibleSize += flexible;
            }
        });
        let totalSpacing = Math.max(0, count - 1) * this.spacing;
        return { totalMinSize: totalMinSize + totalSpacing, totalPreferredSize: totalPreferredSize + totalSpacing, shrinkSize, flexibleSize };
    }

    private getChildElementMinSize(child: UITransform, element: LayoutElement, totalShrinkSize: number, size: number): number {
        if (element == null) return this.getLayoutSize(child);
        let minSize = this.getElementMinSize(child, element);
        let preferredSize = this.getElementPreferredSize(child, element);
        if (totalShrinkSize > 0 && size > 0) {
            let shrinkRate = (preferredSize - minSize) / totalShrinkSize;
            minSize += shrinkRate * size;
        }
        this.setLayoutSize(child, minSize);
        return minSize;
    }

    private getChildElementPreferredSize(child: UITransform, element: LayoutElement, totalFlexibleSize: number, size: number): number {
        if (element == null) return this.getLayoutSize(child);
        let flexibleSize = this.getElementFlexibleSize(element);
        let preferredSize = this.getElementPreferredSize(child, element);
        if (totalFlexibleSize > 0 && size > 0) {
            let flexibleRate = flexibleSize / totalFlexibleSize;
            preferredSize += flexibleRate * size;
        }
        this.setLayoutSize(child, preferredSize);
        return preferredSize;
    }

    protected layoutChildiren(lastOffset: number, getChildSize: GetChildSize2, setPosition: SetPositionEvent): void {
        this.foreachChildren((child, element) => {
            let childSize = getChildSize(child, element);
            let anchor = this.getLayoutAnchor(child);
            lastOffset += childSize * anchor;
            setPosition(child, lastOffset, this.getNoLayoutSize(child));
            lastOffset += childSize * (1 - anchor) + this.spacing;
        });
    }

    protected layoutChildirenBack(margin: number, getChildSize: GetChildSize2, setPosition: SetPositionEvent): void {
        let lastOffset = margin;
        this.foreachChildren((child, element) => {
            let childSize = getChildSize(child, element);
            let anchor = this.getLayoutAnchor(child);
            lastOffset -= childSize * (1 - anchor);
            setPosition(child, lastOffset, this.getNoLayoutSize(child));
            lastOffset -= childSize * anchor + this.spacing;
        });
    }

    protected layoutCenter(margin: number, getChildSize: GetChildSize2, setPosition: SetPositionEvent): void {
        let layoutSize = -this.spacing;
        this.foreachChildren((child, element) => {
            layoutSize += getChildSize(child, element) + this.spacing;
        });
        this.layoutChildiren(-layoutSize * 0.5 - margin, getChildSize, setPosition);
    }

    protected layoutContent(margin: Vec2, anchor: Vec2, getChildSize: GetChildSize2, setPosition: SetPositionEvent): void {
        let layoutSize = -this.spacing + margin.x + margin.y;
        this.foreachChildren((child, element) => {
            layoutSize += getChildSize(child, element) + this.spacing;
        });
        this.setLayoutSize(this.uiTransform, layoutSize);
        this.layoutChildiren(margin.x - layoutSize * anchor.x, getChildSize, setPosition);
    }

    protected layoutFull(margin: Vec2, width: number, anchor: Vec2, setPosition: SetPositionEvent): void {
        let childList: UITransform[] = [];
        let newWidth = width;
        this.foreachChildren((child, element) => {
            if (element != null && this.getElementFlexibleSize(element) <= 0) {
                newWidth -= this.getLayoutSize(child) + this.spacing;
            } else {
                childList.push(child);
            }
        });
        let childWidth = (newWidth - margin.x - margin.y + this.spacing) / childList.length - this.spacing;
        for (let child of childList)
            this.setLayoutSize(child, childWidth);
        this.layoutChildiren(margin.x - width * anchor.x, this.getLayoutSize.bind(this), setPosition);
    }
}