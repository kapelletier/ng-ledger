import {
    Component,
    OnInit,
    AfterViewInit,
    Output,
    Input,
    EventEmitter,
    HostListener,
    Query,
    ViewChild
} from '@angular/core';

import { IColumnDefinition } from './IColumnDefinition';
import { LedgerService } from './ledger.service';
import { LedgerCellComponent } from './ledger-cell.cmp';

@Component({
    styleUrls: ['./ledger-row.css'],
    selector: '[ledger-row]',
    templateUrl: './ledger-row.cmp.html'
})
export class LedgerRowComponent implements OnInit, AfterViewInit {
    @Input() ColumnDefs: IColumnDefinition[];
    @Input() RowIndex: number;
    @Input() Model: any;
    public IsRowFocused: boolean;
    public IsToolButtonVisible: boolean;
    private timer: number;

    @ViewChild(LedgerCellComponent) firstCell: LedgerCellComponent

    @HostListener("focusin") handleRowFocus() {
        window.clearTimeout(this.timer);
        //this.IsRowFocused = true;
        this._service.NotifyFocusChanged(this.RowIndex, true);
    };

    @HostListener("focusout") handleLostFocus() {
        this.timer = window.setTimeout(() => {

        }, 50);
        //this.IsRowFocused = false;
        //let the service know that we lost focus... could also emit an event 
        this._service.NotifyFocusChanged(this.RowIndex, false)
    };

    @HostListener("mouseenter") handleMouseOver() {
        this.IsToolButtonVisible = true;
    };

    @HostListener("mouseleave") handleMouseLeave() {
        this.IsToolButtonVisible = false;
    };

    @HostListener("keypress", ['$event']) handleKeyPress(evt) {
        if (evt.keyCode === 13) {
            this._service.NotifyEnterPressed(this.RowIndex);
            event.stopPropagation();
            event.preventDefault();
            return false;
        }

    };

    constructor(private _service: LedgerService) {

    }

    ngAfterViewInit() {
    }

    public SetCellFocus() {
        if (this.firstCell) {
            //if you don't set a little timeout here, then Angular complains since you'll
            //end up updating the bindings on the same process that set them originally
            setTimeout(()=>{ this.firstCell.SetFocus()}, 20);
        }
        else {
            console.log("no first cell");
        }
    }

    public RequestRemoveRow(rowIndex) {
        //emit this up so the grid can add a row after this one
        this._service.RequestRemoveRow(rowIndex);
        event.stopPropagation();
        return false;
    }

    ngOnInit() {

    }
}