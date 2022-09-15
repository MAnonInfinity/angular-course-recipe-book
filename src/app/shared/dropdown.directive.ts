import { Directive, ElementRef, HostBinding, HostListener } from "@angular/core";

@Directive({
    selector: '[appDropdown]'
})

export class DropdownDirective {
    @HostBinding('class.open') isOpen = false

    // @HostListener('click') toggleOpen() {
    //     this.isOpen = !this.isOpen
    // }

    // to be able to close the dropdown from anywhere
    @HostListener('document:click', ['$event']) toggleOpen(event: Event) {
        this.isOpen = this.elementRef.nativeElement.contains(event.target) ? !this.isOpen : false;
    }

    constructor(private elementRef: ElementRef) {}
}