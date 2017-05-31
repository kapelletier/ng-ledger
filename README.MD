# ng-ledger

## Installation

To install this library, run:

```bash
$ npm install ng-ledger --save
```

## Consuming the library

From an Angular Module such as `AppModule`:

```typescript
import {} ...

// Import the ledger module
import { LedgerModule } from 'ng-ledger';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,

    // Specify your library as an import
    LedgerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Development
Once your library is imported, you can use it:
```typescript
import { Component } from '@angular/core';
import { IColumnDefinition } from "ng-ledger";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Add Some Rows';
  public ColumnDefs: IColumnDefinition[] = [
        { inputType: "input", dataType: "text", fieldName: "sample", label: "Sample Name", width:"40%" },
        { inputType: "input",dataType: "text", fieldName: "group", label: "Group", width: "40%" },
        { inputType: "input", dataType: "number", fieldName: "readCount", label: "Total Read Count", width:"20%" }
    ];

   public RowData: any[] = [];
}
```

Here's what the HTML can look like:

```xml
<!-- You can now use your library component in the html of a component -->
<h1>
  {{title}}
</h1>
<!-- 
  Validate Cells turns on/off cell-level validation
  It works with standard ngModel binding or reactive forms as well
  ColumnDefinitions allows you to define column properties... see above
 -->
<ledger [ValidateCells]="true" [(ngModel)]="RowData" [ColumnDefinitions]="ColumnDefs"></ledger> 
```

## License

MIT © [Keith Pelletier](mailto:keith.pelletier@umassmed.edu)
