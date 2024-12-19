import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-app-testing',
  templateUrl: './app-testing.component.html',
  styleUrls: ['./app-testing.component.css']
})
export class AppTestingComponent implements OnInit {

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
