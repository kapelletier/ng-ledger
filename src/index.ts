import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {LedgerComponent} from './ledger.cmp';
import {LedgerColumnComponent} from './ledger-column.cmp';
import {LedgerRowComponent} from './ledger-row.cmp';
import {LedgerCellComponent} from './ledger-cell.cmp';
import {CellFocus} from './cell-focus.directive'
import {LedgerService} from './ledger.service';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/operator/debounceTime";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        LedgerComponent,
        LedgerColumnComponent,
        LedgerRowComponent,
        LedgerCellComponent,
        CellFocus
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    exports: [
        LedgerComponent,
        LedgerColumnComponent,
        LedgerRowComponent,
        LedgerCellComponent
    ],
    providers: [
        LedgerService
    ],
    entryComponents: [
        
    ]
})
export class LedgerModule {
// static forRoot(): ModuleWithProviders {
//     return {
//       ngModule: LedgerModule,
//       providers: [LedgerService]
//     };
//   }
}