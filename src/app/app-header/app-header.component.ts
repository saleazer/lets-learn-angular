import { Component } from '@angular/core';
import { AppHeaderContent } from '../models/content/app-header.content';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent {
  constructor() {}

  content = new AppHeaderContent();


}
