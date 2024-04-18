import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { CoursesService } from "./courses.service";
import { COURSES, findLessonsForCourse } from "../../../../server/db-data";
import { Course } from "../model/course";
import { HttpErrorResponse } from "@angular/common/http";

describe('CoursesService', () => {

  let success = false;
  let abaResponse = { bankValidationRs: { bankName: 'invalid bank' } };
  let coursesService: CoursesService;
  let httpTestingController: HttpTestingController;
  let mockSubscribe = (object: any) => (f: any) => {
    if (!f.next) {
      f(object);
    } else {
      if (success) {
        f.next(object);
      } else {
        f.error(object);
      }
    }
  };

  beforeEach(() => {
    const coursesServiceStub = () => ({
      findAllCourses: (routingNumber: any) => ({ subscribe: mockSubscribe(abaResponse) })
    });
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CoursesService,
        HttpClientTestingModule
      ]
    });
    coursesService = TestBed.inject(CoursesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should retrieve all courses', () => {
    coursesService.findAllCourses().subscribe(courses => {
      expect(courses).toBeTruthy('No courses returned');
      expect(courses.length).toBe(12, 'incorrect number of courses');
      const course = courses.find(course => course.id == 12);
      expect(course.titles.description).toBe('Angular Testing Course');
    });
    const req = httpTestingController.expectOne('/api/courses');
    expect(req.request.method).toEqual('GET');
    req.flush({ payload: Object.values(COURSES) });
  });

  it('should find a course by id', () => {
    coursesService.findCourseById(12).subscribe(course => {
      expect(course).toBeTruthy();
      expect(course.id).toBe(12);
    });
    const req = httpTestingController.expectOne('/api/courses/12');
    expect(req.request.method).toEqual('GET');
    req.flush(COURSES[12]);
  });

  it('should save a course', () => {
    const changes: Partial<Course> = { titles: { description: 'Testing' } };

    coursesService.saveCourse(12, changes).subscribe(course => {
      expect(course.id).toBe(12);
    });
    const req = httpTestingController.expectOne('/api/courses/12');
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body.titles.description).toBe(changes.titles.description);
    req.flush({ ...COURSES[12], ...changes });
  });

  it('should give an error if save course fails', () => {
    const changes: Partial<Course> = { titles: { description: 'Testing' } };

    coursesService.saveCourse(12, changes).subscribe(
      () => fail('The save course operation should fail'),
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
      }
    );
    const req = httpTestingController.expectOne('/api/courses/12');
    expect(req.request.method).toEqual('PUT');
    req.flush('Save course failed', { status: 500, statusText: 'Internal server error' });
  });

  it('should find a list of lessons', () => {
    coursesService.findLessons(12).subscribe(lessons => {
      expect(lessons).toBeTruthy();
      expect(lessons.length).toBe(3);
    });
    const req = httpTestingController.expectOne(req => req.url == '/api/lessons');
    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('courseId')).toEqual('12');
    expect(req.request.params.get('filter')).toEqual('');
    expect(req.request.params.get('sortOrder')).toEqual('asc');
    expect(req.request.params.get('pageNumber')).toEqual('0');
    expect(req.request.params.get('pageSize')).toEqual('3');
    req.flush({
      payload: findLessonsForCourse(12).slice(0, 3)
    });
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});
