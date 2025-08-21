import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppHeaderComponent } from './app-header.component';

describe('AppHeaderComponent', () => {
  let component: AppHeaderComponent;
  let fixture: ComponentFixture<AppHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe("timesTwoTestChange", () => {
    it("should return the input value multiplied by two", () => {
      let results = component.timesTwo(2);

      expect(results).toBe(4);
    });
  });

  describe("timesFourTestChange", () => {
    it("should return the input value multiplied by four", () => {
      let results = component.timesFour(2);

      expect(results).toBe(8);
    });
  });

  describe("timesEightTest", () => {
    it("should return the input value multiplied by eight", () => {
      let results = component.timesEight(2);

      expect(results).toBe(16);
    });
  });
});
