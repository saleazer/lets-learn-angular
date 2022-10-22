import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AngularResourcesComponent } from './angular-resources/angular-resources.component';

const routes: Routes = [
  { path: '**', component: AngularResourcesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

