import { Component, Directive, Input, Renderer2, ElementRef } from '@angular/core'

@Directive({
  selector: '[cellFocus]'
})
export class CellFocus {

  constructor(public renderer: Renderer2, public elementRef: ElementRef) {}
 
  ngOnInit() {
  }

  public SetInputFocus(){
    this.elementRef.nativeElement.focus();
  }
}