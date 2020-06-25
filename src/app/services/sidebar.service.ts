import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  constructor() { }

  opened: boolean = false;

  getSidebarStatus() {
    return this.opened;
  }

  setSidebarStatus(opened: boolean) {
    this.opened = opened;
  }
}
