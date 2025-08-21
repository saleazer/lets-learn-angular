import { Component, OnInit } from '@angular/core';
import { AppFooterContent } from '../models/content/app-footer.content';

@Component({
  selector: 'app-footer',
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.css']
})
export class AppFooterComponent implements OnInit {

  constructor() { }

  content = new AppFooterContent();

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
