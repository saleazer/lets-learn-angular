import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ReactiveFormComponent } from './reactive-form.component';

describe('ReactiveFormComponent', () => {
  let component: ReactiveFormComponent;
  let fixture: ComponentFixture<ReactiveFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      declarations: [ ReactiveFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactiveFormComponent);
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
