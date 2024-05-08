import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CoursesCardListComponent } from './courses-card-list.component';
import { CoursesModule } from '../courses.module';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { setupCourses } from '../common/setup-test-data';

describe('CoursesCardListComponent', () => {

  let component: CoursesCardListComponent;
  let fixture: ComponentFixture<CoursesCardListComponent>;
  let el: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CoursesModule]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(CoursesCardListComponent);
      component = fixture.componentInstance;
      el = fixture.debugElement;
      component.courses = setupCourses();
      fixture.detectChanges();
    });
  }));

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should display the course list", () => {
    const cards = el.queryAll(By.css('.course-card'));
    expect(cards).toBeTruthy();
    expect(cards.length).toBe(12, 'unexpected number of courses');
  });

  it("should display the first course", () => {
    const course = component.courses[0];
    const card = el.query(By.css('.course-card:first-child'));
    const title = card.query(By.css('mat-card-title'));
    const image = card.query(By.css('img'));

    expect(card).toBeTruthy('Could not find the course card');
    expect(title.nativeElement.textContent).toBe(course.titles.description);
    expect(image.nativeElement.src).toBe(course.iconUrl);
  });
});


