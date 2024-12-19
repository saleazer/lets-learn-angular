import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTestingComponent } from './app-testing.component';

describe('AppTestingComponent', () => {
  let component: AppTestingComponent;
  let fixture: ComponentFixture<AppTestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppTestingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe("timesTwo", () => {
    it("should return the input value multiplied by two", () => {
      let results = component.timesTwo(2);

      expect(results).toBe(4);
    });
  });

  describe("timesFour", () => {
    it("should return the input value multiplied by four", () => {
      let results = component.timesFour(2);

      expect(results).toBe(8);
    });
  });

  describe("timesEight", () => {
    it("should return the input value multiplied by eight", () => {
      let results = component.timesEight(2);

      expect(results).toBe(16);
    });
  });
});
