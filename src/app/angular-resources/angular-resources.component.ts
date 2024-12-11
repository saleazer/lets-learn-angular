import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-angular-resources',
  templateUrl: './angular-resources.component.html',
  styleUrls: ['./angular-resources.component.css']
})
export class AngularResourcesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {

  }

  timesTwo(entry: number): number {
    return entry * 2;
  }

  timesFour(entry: number): number {
    return entry * 4;
  }

  timesEight(entry: number): number {
    return entry * 8;
  }

}
