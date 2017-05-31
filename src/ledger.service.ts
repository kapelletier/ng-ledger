import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import {ICellValueChangeArgs} from './model/ICellValueChangeArgs';
import {ICellValidityChangeArgs} from './model/ICellValidityChangeArgs';

@Injectable()
export class LedgerService {
    private focusChanged = new Subject<any>();
    public FocusChanged = this.focusChanged.asObservable();
    
    private valueChanged = new Subject<ICellValueChangeArgs>();
    public ValueChanged = this.valueChanged.asObservable();

    private validityChanged = new Subject<ICellValidityChangeArgs>();
    public ValidityChanged = this.validityChanged.asObservable();

    private cellInitialized = new Subject<ICellValueChangeArgs>();
    public CellInitialized = this.cellInitialized.asObservable();

    private removeRowRequest = new Subject<number>();
    public RemoveRowRequest = this.removeRowRequest.asObservable();

    private enterPressed = new Subject<number>();
    public EnterPressed = this.enterPressed.asObservable();

    //public LedgerData: any[] = [];

    public ShouldValidate:boolean;

    constructor() {
    }

    public NotifyValueChanged(args: ICellValueChangeArgs){
        this.valueChanged.next(args);
    }

     public NotifyValidityChanged(args: ICellValidityChangeArgs){
        this.validityChanged.next(args);
    }

    public RequestRemoveRow(rowIndex: number){
        this.removeRowRequest.next(rowIndex);
    }

    public NotifyFocusChanged(rowIndex: number, focused: boolean){
        this.focusChanged.next({row: rowIndex, isFocused: focused});
    }

     public NotifyEnterPressed(rowIndex: number){
        this.enterPressed.next(rowIndex);
    }
}