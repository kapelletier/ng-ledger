import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  AfterViewInit,
  ViewChild
} from '@angular/core';

import { LedgerService } from './ledger.service';
import { ICellValueChangeArgs } from './ICellValueChangeArgs';
import { ICellValidityChangeArgs } from './ICellValidityChangeArgs';
import { FormControl, Validators } from '@angular/forms';
import {CellFocus} from './cell-focus.directive';
import { Observable } from 'rxjs/Observable';

@Component({
  styleUrls: ['./ledger-cell.css'],
  selector: 'ledger-cell',
  templateUrl: './ledger-cell.cmp.html'
})
export class LedgerCellComponent implements OnInit, AfterViewInit {
  @Input() ColumnDefinition: any;
  @Input() RowIndex: number;
  @Input() ColumnIndex: number;
  @Input() DataValue: any;

   @ViewChild(CellFocus) focuser: CellFocus;

  public IsInValid: boolean = false;
  public IsEditing: boolean = true;
  public InputValue: any;
  private currentStatus: string;
  private focusDirective: CellFocus;
  public cellValue: FormControl;

  constructor(private _service: LedgerService) {

  }


  private notifyOnChange(val) {
    try{
    let args: ICellValueChangeArgs = {
      NewValue: this.InputValue,
      RowIndex: this.RowIndex,
      FieldName: this.ColumnDefinition.fieldName
    }

    this._service.NotifyValueChanged(args);
    } catch(err){
      console.log("failed in notify change");
    }
  }

  private verifyValidity(status: string) {
    try{
    if (status !== this.currentStatus) {
      this.IsInValid = this.cellValue.invalid;
      this.currentStatus = status;
      let args: ICellValidityChangeArgs = {
        FieldName: this.ColumnDefinition.fieldName,
        IsValid: !this.cellValue.invalid,
        RowIndex: this.RowIndex
      };
      this._service.NotifyValidityChanged(args);
    }
    } catch(err){
      console.log("failed verifying validity");
    }
  }

  public SetFocus(){
    try{
    //now get the directive that wraps our native input control and set focus. This is arguably a really 
    //convoluated way to set focus... but I'm trying to avoid making direct elementRef calls and walk the actual DOM
    if(this.focuser){
      this.focuser.SetInputFocus();
    }
    else
    {
      console.log("no focus directive");
    }
    } catch(err){
      console.log("failed setting focus");
    }
  }

  ngOnInit() {
    try{
    if (this._service.ShouldValidate) {
      this.cellValue = new FormControl('', Validators.required);
    }
    else {
      this.cellValue = new FormControl('');
    }
    this.InputValue = this.DataValue[this.ColumnDefinition.fieldName]
    this.cellValue.setValue(this.InputValue);

    if (this._service.ShouldValidate === true) {
      this.IsInValid = this.cellValue.invalid;
      this.cellValue.statusChanges.subscribe((v) => {
        this.verifyValidity(v);
      });
    }
    this.cellValue.valueChanges.debounceTime(500).subscribe((v) => {
      this.InputValue = v;
      this.notifyOnChange(v);
    });
    } catch(err){
      console.log("failed initializing cell");
    }
  }

  ngAfterViewInit() {
  }
}