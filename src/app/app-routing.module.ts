import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppHomeComponent } from './app-home/app-home.component';
import { AngularResourcesComponent}  from './angular-resources/angular-resources.component'
import { ReactiveFormComponent } from './reactive-form/reactive-form.component';

const routes: Routes = [

  { path: 'angular', component: AngularResourcesComponent },
  { path: 'form', component: ReactiveFormComponent },
  { path: '**', component: AppHomeComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

