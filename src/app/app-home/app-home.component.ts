import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './app-home.component.html',
  styleUrls: ['./app-home.component.css']
})
export class AppHomeComponent implements OnInit {

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
