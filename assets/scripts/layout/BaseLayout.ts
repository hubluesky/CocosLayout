import { CCFloat, Component, director, Director, Enum, Node, UITransform, Vec2, _decorator } from "cc";
import LayoutElement from "./LayoutElement";

const { ccclass, property, executeInEditMode } = _decorator;

interface OnPositionEvent {
    (uiTransform: UITransform, x: number, height: number): void;
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

@ccclass("Border")
export class Border {
    @property({ type: CCFloat, step: 1, tooltip: "Border top" })
    public top: number = 0;
    @property({ type: CCFloat, step: 1, tooltip: "Border bottom" })
    public bottom: number = 0;
    @property({ type: CCFloat, step: 1, tooltip: "Border left" })
    public left: number = 0;
    @property({ type: CCFloat, step: 1, tooltip: "Border right" })
    public right: number = 0;
}

@executeInEditMode
export default abstract class BaseLayout extends Component {
    @property({ type: Border, tooltip: "容器的边距" })
    protected border: Border = new Border();
    @property({ type: CCFloat, tooltip: "子节点之间的间距" })
    protected spacing: number = 0;
    @property({ type: Enum(LayoutAlignment), tooltip: "水平对齐方式" })
    protected horizontalAlignment: LayoutAlignment = LayoutAlignment.Center;
    @property({ type: Enum(LayoutAlignment), tooltip: "垂直对齐方式" })
    protected verticalAlignment: LayoutAlignment = LayoutAlignment.Center;
    @property
    protected _reverse: boolean = false;
    @property({ tooltip: "子节点倒过来排序" })
    public get reverse() { return this._reverse; };
    public set reverse(v) {
        this._reverse = v;
        this.foreachChildren = this.getForeachChildren(v);
        this.layoutDirty();
    }

    private isDirty: boolean = false;
    private uiTransform: UITransform;
    protected foreachChildren: (callback: (uiTransform: UITransform) => void) => void;

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

    protected getForeachChildren(reverse: boolean): (callback: (uiTransform: UITransform) => void) => void {
        let callChildFunc = (child: UITransform, callback: (uiTransform: UITransform) => void) => {
            if (child.node.active && child.getComponent(LayoutElement)?.ignoreLayout == null)
                callback(child);
        };
        if (reverse) {
            return (callback: (uiTransform: UITransform) => void) => {
                for (let i = this.node.children.length - 1; i >= 0; i--) {
                    callChildFunc(this.node.children[i].getComponent(UITransform), callback);
                }
            };
        } else {
            return (callback: (uiTransform: UITransform) => void) => {
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
    protected abstract getNodeAnchor(node: UITransform): Vec2;
    protected abstract getMargins(): Vec2[];
    protected abstract setNodePosition(node: UITransform, x: number, y: number): void;
    protected abstract getNodeWidth(node: UITransform): number;
    protected abstract getNodeHeight(node: UITransform): number;
    protected abstract setNodeWidth(node: UITransform, w: number): void;
    protected abstract setNodeHeight(node: UITransform, h: number): void;

    public forceDoLayout(): void {
        this.isDirty = false;
        const margins = this.getMargins();
        const width = this.getNodeWidth(this.uiTransform);
        const anchor = this.getNodeAnchor(this.uiTransform);
        const outHeight = { maxHeight: 0 };
        const alignmentFunc = this.getAlignmentFunction(this.sign, anchor.y, margins[1], outHeight);
        switch (this.layoutType) {
            case LayoutAlignment.Forward:
                this.layoutChildiren(this.sign, BaseLayout.signValue(margins[0].x - width * anchor.x, this.sign), alignmentFunc);
                break;
            case LayoutAlignment.Backward:
                this.layoutChildiren(-this.sign, BaseLayout.signValue(-margins[0].y + width * (1 - anchor.x), this.sign), alignmentFunc);
                break;
            case LayoutAlignment.Center:
                this.layoutCenter(this.sign, BaseLayout.signValue(width * (anchor.x - 0.5) - margins[0].x + margins[0].y, this.sign), alignmentFunc);
                break;
            case LayoutAlignment.Full:
                this.layoutFull(this.sign, margins[0], width, anchor, alignmentFunc);
                break;
            case LayoutAlignment.Content:
                this.layoutContent(this.sign, margins[0], width, anchor, alignmentFunc);
                break;
        }

        if (this.alignment == LayoutAlignment.Content)
            this.setNodeHeight(this.uiTransform, outHeight.maxHeight + margins[1].x + margins[1].y);
    }

    protected getAlignmentFunction(sign: number, anchor: number, margin: Vec2, outHeight: { maxHeight: number }): OnPositionEvent {
        return (uiTransform: UITransform, x: number, height: number) => {
            let contentHeight = this.getNodeHeight(this.uiTransform);
            switch (this.alignment) {
                case LayoutAlignment.Forward:
                    this.setNodePosition(uiTransform, x, BaseLayout.signValue(contentHeight * (1 - anchor) - 0.5 * height - margin.x, sign));
                    break;
                case LayoutAlignment.Backward:
                    this.setNodePosition(uiTransform, x, BaseLayout.signValue(-contentHeight * anchor + 0.5 * height + margin.y, sign));
                    break;
                case LayoutAlignment.Center:
                    this.setNodePosition(uiTransform, x, BaseLayout.signValue(-contentHeight * (anchor - 0.5) - margin.x + margin.y, sign));
                    break;
                case LayoutAlignment.Full:
                    this.setNodePosition(uiTransform, x, BaseLayout.signValue(contentHeight * (1 - anchor) - 0.5 * height - margin.x, sign));
                    this.setNodeHeight(uiTransform, contentHeight - margin.x - margin.y);
                    break;
                case LayoutAlignment.Content:
                    this.setNodePosition(uiTransform, x, BaseLayout.signValue(contentHeight * (1 - anchor) - 0.5 * height - margin.x, sign));
                    outHeight.maxHeight = Math.max(outHeight.maxHeight, height);
                    break;
            }
        }
    }

    protected layoutChildiren(sign: number, margin: number, onPosition: OnPositionEvent): void {
        let lastOffset = margin;
        let spacing = BaseLayout.signValue(this.spacing, sign);
        this.foreachChildren((child) => {
            let childSize = BaseLayout.signValue(this.getNodeWidth(child) * 0.5, sign);
            lastOffset += childSize;
            onPosition(child, lastOffset, this.getNodeHeight(child));
            lastOffset += childSize + spacing;
        });
    }

    protected layoutCenter(sign: number, margin: number, onPosition: OnPositionEvent): void {
        let layoutSize = -this.spacing;
        this.foreachChildren((child) => {
            layoutSize += this.getNodeWidth(child) + this.spacing;
        });
        this.layoutChildiren(sign, BaseLayout.signValue(-layoutSize * 0.5, sign) - margin, onPosition);
    }

    protected layoutContent(sign: number, margin: Vec2, width: number, anchor: Vec2, onPosition: OnPositionEvent): void {
        let layoutSize = -this.spacing + margin.x + margin.y;
        this.foreachChildren((child) => {
            layoutSize += this.getNodeWidth(child) + this.spacing;
        });
        this.setNodeWidth(this.uiTransform, layoutSize);
        this.layoutChildiren(sign, BaseLayout.signValue(margin.x - width * anchor.x, sign), onPosition);
    }

    protected layoutFull(sign: number, margin: Vec2, width: number, anchor: Vec2, onPosition: OnPositionEvent): void {
        let childList: UITransform[] = [];
        let newWidth = width;
        this.foreachChildren((child) => {
            let layoutElement = child.getComponent(LayoutElement);
            if (layoutElement != null) {
                newWidth -= this.getNodeWidth(child) + this.spacing;
            } else {
                childList.push(child);
            }
        });
        let childWidth = (newWidth - margin.x - margin.y + this.spacing) / childList.length - this.spacing;
        for (let child of childList)
            this.setNodeWidth(child, childWidth);
        this.layoutChildiren(sign, BaseLayout.signValue(margin.x - width * anchor.x, sign), onPosition);
    }

    protected static signValue(value: number, sign: number): number {
        return sign === -1 ? -value : value;
    }
}