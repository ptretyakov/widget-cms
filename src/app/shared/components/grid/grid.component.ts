import {
  Component, OnInit, ViewChild, Input, ViewChildren, ViewContainerRef,
  QueryList, AfterViewInit, Output, EventEmitter
} from '@angular/core';

import { Widget, createEmptyWidgetObject, WidgetBackbone } from './interfaces/widget';
import { WidgetPositionChange, NgxWidgetGridComponent } from 'ngx-widget-grid';
import { MatDialog, MatBottomSheet } from '@angular/material';
import { GroupDialogComponent } from './group-dialog/group-dialog.component';
import { FieldSheetComponent } from './field-sheet/field-sheet.component';
import { CmsDocumentField } from 'src/app/admin/documents/document/shared/interfaces/cms-document-field';
import { CollectionSheetComponent } from './collection-sheet/collection-sheet.component';
import { Collection } from 'src/app/admin/collections/collection/collection';
import { CmsDocument } from 'src/app/admin/documents/document/cms-document';

export interface GridData {
  documents: CmsDocument[];
}

const initGridData: GridData = {
  documents: [],
};

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent implements OnInit, AfterViewInit {
  @Output() widgetsUpdated = new EventEmitter<WidgetBackbone[]>();

  @ViewChild('grid') grid: NgxWidgetGridComponent;
  @ViewChildren('widgetsRefs', { read: ViewContainerRef })
    widgetsRefs: QueryList<ViewContainerRef>;

  @Input() data: GridData = initGridData;
  @Input() widgets: Widget[] = [];

  @Input() gridWidth;
  @Input() gridHeight = 500;

  @Input() cols = 12;
  @Input() rows = 12;
  @Input() movable = true;
  @Input() editable = true;
  @Input() showGrid = true;
  @Input() showPanel = true;
  @Input() resizable = true;
  @Input() swapWidgets = false;
  @Input() highlightNextPosition = false;

  constructor(
    public dialog: MatDialog,
    private bottomSheet: MatBottomSheet
  ) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.widgetsRefs.notifyOnChanges = () => {
      this.widgetsRefs.forEach((ref) => {
        // Take widget dom element sizes
        this.updateWidgetSizeInformation({ ref });
        this.prepareWidgetsInformation();
      });
    };
  }

  // =========================================================
  //                        Grid events
  // =========================================================

  onWidgetPositionChange($event: WidgetPositionChange): void {
    this.widgets[$event.index].position = { ...$event.newPosition };

    this.updateWidgetSizeInformation({ widget:  this.widgets[$event.index]});
    this.prepareWidgetsInformation();
  }

  onClickAddWidget(): void {
    this.createWidget();
  }

  onClickDeleteWidget(index) {
    this.widgets.splice(index, 1);
  }

  onCloseGroupDialog(widget: Widget, widgets: WidgetBackbone[]) {
    const { height: rows, width: cols } = widget.position;
    widget.content = { ...widget.content, group: widgets, grid: { cols, rows } };
    this.prepareWidgetsInformation();
  }

  onSelectDocumentField(
    widget: Widget,
    result: { field: CmsDocumentField, document: CmsDocument }
  ) {
    this.addDocumentToData(result.document);

    widget.content = {
      ...widget.content,
      field: {
        id: result.field._id,
        documentId: result.document._id,
      }
    };

    this.prepareWidgetsInformation();

    console.log('onSelectDocumentField', { widget, data: this.data });
  }

  onSelectCollection(widget: Widget, collection: Collection) {
    console.log('onSelectCollection', { widget, collection });
    widget.content.collection = collection;
    this.prepareWidgetsInformation();
  }

  toggleHighlight(doHighlight: boolean): void {
    this.highlightNextPosition = !!doHighlight;
  }

  onGridFull(event: any): void { }

  // =========================================================
  //                   Search methods
  //  ========================================================

  getRefById(id: string): ViewContainerRef {
    return this.widgetsRefs.find((ref) => {
      return ref.element.nativeElement.id === id;
    });
  }

  getWidgetById(id: string): Widget {
    return this.widgets.find((widget) => {
      return widget.id === id;
    });
  }

  getWidgetByRef(ref: ViewContainerRef): Widget {
    return this.getWidgetById(ref.element.nativeElement.id);
  }

  getFieldFromDataById({ id, documentId }: { id: string, documentId: string}) {
    const document = this.data.documents.find(doc => documentId === doc._id);
    return (document) ? document.fields.find(field => field._id === id) : null;
  }

  // =========================================================
  //                      Methods
  // =========================================================
  addDocumentToData(document: CmsDocument) {
    if (!this.data.documents.find(doc => document._id === doc._id)) {
      this.data.documents.push(document);
    }
  }

  prepareWidgetsInformation(): WidgetBackbone[] {
    const widgets: WidgetBackbone[] = this.widgets.map((widget) => {
      return {
        size: { ...widget.size },
        content: { ...widget.content },
        position: { ...widget.position },
      };
    });

    this.widgetsUpdated.emit(widgets);
    return widgets;
  }

  createWidget(content?): Widget {
    const nextPosition = this.grid.getNextPosition();

    if (content) {
      this.widgets.push({
        ...createEmptyWidgetObject(),
        position: { ...nextPosition },
        content: { ...content },
      });
    } else {
      this.widgets.push({
        ...createEmptyWidgetObject(),
        position: { ...nextPosition },
      });
    }

    return [ ...this.widgets ].pop();
  }

  openFieldDialog(widget: Widget): void {
    this.bottomSheet
      .open(FieldSheetComponent)
      .afterDismissed()
        .subscribe(
          (result: { field: CmsDocumentField, document: CmsDocument }) => {
            this.onSelectDocumentField(widget, result);
          }
        );
  }

  openGroupDialog(widget: Widget): void {
    this.dialog
      .open(
        GroupDialogComponent,
        { data: { position: widget.position, size: widget.size } }
      )
      .afterClosed()
        .subscribe((groupDialogResult: WidgetBackbone[]) => {
          this.onCloseGroupDialog(widget, groupDialogResult);
        });
  }

  openCollectionSheet(widget: Widget): void {
    this.bottomSheet
      .open(CollectionSheetComponent)
      .afterDismissed()
        .subscribe((collection: Collection) => {
          this.onSelectCollection(widget, collection);
        });
  }

  updateWidgetSizeInformation(
    config: {
      id?: string,
      ref?: ViewContainerRef,
      size?: { width: number, height: number },
      widget?: Widget,
    }
  ): void {
    const getRefSize = (ref: ViewContainerRef) => {
      const el = ref.element.nativeElement;
      const { offsetWidth: width, offsetHeight: height} = el;
      return { width, height };
    };

    if (config.widget) {
      const ref = this.getRefById(config.widget.id);

      if (ref) {
        config.widget.size = getRefSize(ref);
      }
    }

    if (config.ref) {
      const widget = this.getWidgetByRef(config.ref);

      if (widget) {
        widget.size = getRefSize(config.ref);
      }
    }

    if (config.id && config.size) {
      const widget = this.getWidgetById(config.id);
      widget.size = config.size;
    }
  }
}