import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularResourcesComponent } from './angular-resources.component';

describe('AngularResourcesComponent', () => {
  let component: AngularResourcesComponent;
  let fixture: ComponentFixture<AngularResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AngularResourcesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AngularResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
