import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppHeaderComponent } from './app-header/app-header.component';
import { AppFooterComponent } from './app-footer/app-footer.component';
import { AppHomeComponent } from './app-home/app-home.component';
import { AngularResourcesComponent } from './angular-resources/angular-resources.component';
import { ReactiveFormComponent } from './reactive-form/reactive-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';

@NgModule({
  declarations: [
    AppComponent,
    AppHeaderComponent,
    AppFooterComponent,
    AppHomeComponent,
    AngularResourcesComponent,
    ReactiveFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    StoreModule.forRoot({}, {})
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
