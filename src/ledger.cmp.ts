import {
  Component,
  OnInit,
  Output,
  Input,
  OnDestroy,
  EventEmitter,
  forwardRef,
  ViewChildren,
  AfterViewInit,
  QueryList
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms'
import { Subscription } from 'rxjs/Subscription';
import { IColumnDefinition } from './model/IColumnDefinition';
import { LedgerService } from './ledger.service';
import { ICellValueChangeArgs } from './model/ICellValueChangeArgs';
import { ICellValidityChangeArgs } from './model/ICellValidityChangeArgs';
import { LedgerRowComponent } from './ledger-row.cmp'

@Component({
  styleUrls: ['./ledger.css'],
  selector: 'ledger',
  templateUrl: "./ledger.cmp.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LedgerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => LedgerComponent),
      multi: true
    }
  ]
})
export class LedgerComponent implements OnInit, AfterViewInit, ControlValueAccessor, OnDestroy {

  private validitySubscription: Subscription;
  private valueChangeSubscription: Subscription;
  private cellInitializeSubscription: Subscription;
  private removeRowSubscription: Subscription;
  private rowFocusSubscription: Subscription;
  private cellEnterKeySubscription: Subscription;

  public InitializeError: boolean = false;
  public LedgerData: any[] = [];
  /**
   * The Ledger is valid as long as no child inputs are in an invalid state
   */
  public InvalidCells: ICellValidityChangeArgs[] = [];

  @Input() AddRowVisible: boolean;
  @Input() ColumnDefinitions: IColumnDefinition[];
  @Input() ValidateCells: boolean;

  @ViewChildren(LedgerRowComponent) rows: QueryList<LedgerRowComponent>;

  private activeRowIndex: number;


  constructor(private _service: LedgerService) {

    this.valueChangeSubscription = _service.ValueChanged.subscribe(this.valueChange, (err) => { }, () => { });

    this._service.EnterPressed.subscribe((v) => {
      if (this.activeRowIndex == this.LedgerData.length - 1) {
        this.doAddRow();
      } else {
        //go to the next row
        this.activeRowIndex++;
        this.startRowFocus();
      }
    });

    this.rowFocusSubscription = _service.FocusChanged.subscribe((obj) => {
      //it's probably not necessary to reset the activeRowIndex on blur of the grid since 
      //it will always get set during the focs back on the grid cell
      if (obj.isFocused === true) {
        this.activeRowIndex = obj.row;
      }
    });

    this.cellInitializeSubscription = _service.CellInitialized.subscribe(
      (args) => {
        //if they're empty, which they likely would be
        if (args.NewValue === "" || args.NewValue === undefined) {
          //add these to the invalid cells list
        }
      });

  }

  private valueChange = (args: ICellValueChangeArgs) => {
    this.LedgerData[args.RowIndex][args.FieldName] = args.NewValue;
    this.propagateChange(this.LedgerData);
  };

  public validate(c: any) {
    let err = {
      message: "Some required cells are not filled out"
    };
    return (this.InvalidCells.length > 0) ? err : null;
  }

  //this guy will get called whenever some cell in the ledger changes
  //we'll just post the new RowData array
  private propagateChange = (_: any) => { };

  public writeValue(obj: any) {
    //make sure we clear the invalid cells list
    this.InvalidCells = [];
    this.LedgerData = obj;
    if (this.ColumnDefinitions != undefined || this.ColumnDefinitions.length > 0) {
      if (this.LedgerData != undefined) {
        if (this.LedgerData.length === 0) {
          this.LedgerData.push(this.createAddRowFromColDefinitions());
        }
        this.validateLedgerData();
        //this is how we get the framework to come back and call our validate method and update any related forms
        this.propagateChange(this.LedgerData);
      }
    }
    else {
      console.log("No columns defined.")
    }
  }

  private doAddRow() {
    try {

      if (this.activeRowIndex !== this.LedgerData.length - 1 && this.activeRowIndex != undefined && this.activeRowIndex !== -1) {
        let row = this.rows.toArray()[this.activeRowIndex];
        this.LedgerData.splice(this.activeRowIndex + 1, 0, this.createAddRowFromColDefinitions());
      }
      else {
        this.LedgerData.push(this.createAddRowFromColDefinitions());
      }
      this.activeRowIndex++;
      this.validateLedgerData();
      //this is how we get the framework to come back and call our validate method and update any related forms
      this.propagateChange(this.LedgerData);
    }
    catch (err) {
      console.log("error in doAddRow");
    }
  }

  //we'll need to listen to changes from the ledger service and then push those changes up
  //through propagateChange
  public AddRow() {
    this.doAddRow();
    event.preventDefault();
    event.stopPropagation();
  }

  public registerOnChange(fn: any): void {
    //this has access to a function "fn" that informs the outside world about changes
    //looks like we're assigning that function to our propagateChange variable as a lambda
    this.propagateChange = fn;
  }

  public registerOnTouched(fn: any): void { }

  public ngOnInit() {
    if (this.ColumnDefinitions != undefined && this.ColumnDefinitions.length > 0) {
      this._service.ShouldValidate = this.ValidateCells;

      this.removeRowSubscription = this._service.RemoveRowRequest.subscribe((rowIndex) => {
        if (this.LedgerData.length > 1) {
          //need to also remove any invalid rows from the tracker
          for (let c = 0; c < this.ColumnDefinitions.length; c++) {
            let pos = this.InvalidCells.findIndex(
              (v, idx, arr) => { return v.FieldName == this.ColumnDefinitions[c].fieldName && v.RowIndex == rowIndex; });
            if (pos >= 0) {
              this.InvalidCells.splice(pos, 1);
            }
          }
          console.log(this.InvalidCells.length);
          this.LedgerData.splice(rowIndex, 1);
          this.activeRowIndex--;
          this.propagateChange(this.LedgerData);
        }
      });

      if (this.ValidateCells) {
        this.validitySubscription = this._service.ValidityChanged.subscribe((b) => {

          let pos = this.InvalidCells.findIndex(
            (v, idx, arr) => { return v.FieldName == b.FieldName && v.RowIndex == b.RowIndex; });
          if (b.IsValid) {
            //see if it's in our list and if so remove it
            if (pos >= 0) {
              this.InvalidCells.splice(pos, 1);
            }
          }
          else if (!b.IsValid) {
            //see if it's in the list and if not add it
            if (pos == -1) {
              this.InvalidCells.push(b)
            }
          }
          //it seems the form won't call validate unless I propagate a change, which isn't so great
          //will have to find a way to just change the valid state of the form without having to push the whole array up
          //cause there's no need for data binding here
          window.setTimeout(() => { this.propagateChange(this.LedgerData) }, 100);
        });
      }
    }
    else
    {
      this.InitializeError = true;
    }
  }

  private createAddRowFromColDefinitions(): any {
    let obj = {};
    for (let colDef of this.ColumnDefinitions) {
      let val;
      val = (colDef.dataType === "number") ? 0 : "";
      obj[colDef.fieldName] = val;
    }
    return obj;
  }

  /**
   * When the ledger loads, we need to set it's initial valid state. If we try to do this at the cell level
   * then we get loads of subscription alerts and it all just goes to hell
   */
  private validateLedgerData() {
    if (this.ValidateCells === true) {
      //we need to look over the data to 
      for (let i = 0; i < this.LedgerData.length; i++) {
        for (let c = 0; c < this.ColumnDefinitions.length; c++) {
          //let's make sure it's not already tracked as invalid
          let pos = this.InvalidCells.findIndex((v, idx, arr) => { return v.FieldName == this.ColumnDefinitions[c].fieldName && v.RowIndex == i; });
          if (pos === -1) {
            if (this.LedgerData[i][this.ColumnDefinitions[c].fieldName] == undefined ||
              this.LedgerData[i][this.ColumnDefinitions[c].fieldName] === "") {
              //add it to the invalid cells
              let arg: ICellValidityChangeArgs = {
                FieldName: this.ColumnDefinitions[c].fieldName,
                RowIndex: i,
                IsValid: false
              }
              this.InvalidCells.push(arg);
            }
          }
        }
      }
    }
  }

  ngAfterViewInit() {

    this.rows.changes.subscribe((r) => {
      //if a row is added, we can go to that newly added row and focus on the first input
      if (this.activeRowIndex != undefined && this.activeRowIndex !== -1) {

        this.startRowFocus();
      }
      //if a row is deleted, we can go up on and focus on the previous sibling
    });
  }

  private startRowFocus() {
    //we're going to assume that the grid will update the activeRowIndex also on deletes and adds so the focus all works
    let row = this.rows.toArray()[this.activeRowIndex];
    if (row) {
      row.SetCellFocus();
    }
  }

  ngOnDestroy() {
    if (this.valueChangeSubscription != undefined) {
      this.valueChangeSubscription.unsubscribe();
    }
    if (this.validitySubscription != undefined) {
      this.validitySubscription.unsubscribe();
    }
    if (this.cellInitializeSubscription != undefined) {
      this.cellInitializeSubscription.unsubscribe();
    }
    if (this.removeRowSubscription != undefined) {
      this.removeRowSubscription.unsubscribe();
    }

    if (this.rowFocusSubscription != undefined) {
      this.rowFocusSubscription.unsubscribe();
    }
  }
}