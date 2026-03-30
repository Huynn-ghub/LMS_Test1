import { jest } from '@jest/globals';

const mockCourseReviewRepo = {
  findPendingCourses: jest.fn(),
  countPendingCourses: jest.fn(),
  countApprovedCourses: jest.fn(),
  countRejectedCourses: jest.fn(),
  findById: jest.fn(),
  approveCourse: jest.fn(),
  rejectCourse: jest.fn(),
  findApprovedCourses: jest.fn(),
  findRejectedCourses: jest.fn(),
};

jest.unstable_mockModule('../repositories/courseReviewRepository.js', () => mockCourseReviewRepo);

const courseReviewService = await import('../services/courseReviewService.js');

beforeEach(() => jest.clearAllMocks());

describe('getPendingCourses', () => {
  test('returns paginated pending courses', async () => {
    const fakeCourses = [{ _id: 'c1' }];
    mockCourseReviewRepo.findPendingCourses.mockResolvedValue(fakeCourses);
    mockCourseReviewRepo.countPendingCourses.mockResolvedValue(11);

    const result = await courseReviewService.getPendingCourses({ page: 2, limit: 10 });

    expect(result).toEqual({
      courses: fakeCourses,
      total: 11,
      page: 2,
      limit: 10,
      totalPages: 2,
    });
    expect(mockCourseReviewRepo.findPendingCourses).toHaveBeenCalledWith({ page: 2, limit: 10 });
  });
});

describe('getCourseDetailForReview', () => {
  test('throws when course is missing', async () => {
    mockCourseReviewRepo.findById.mockResolvedValue(null);

    await expect(courseReviewService.getCourseDetailForReview('bad-id')).rejects.toThrow(
      'Kh'
    );
  });

  test('throws when course is not published', async () => {
    mockCourseReviewRepo.findById.mockResolvedValue({ _id: 'c1', status: 'draft' });

    await expect(courseReviewService.getCourseDetailForReview('c1')).rejects.toThrow(
      'Chi co the duyet'
    );
  });

  test('returns published course for review', async () => {
    const fakeCourse = { _id: 'c1', status: 'published', reviewStatus: 'pending' };
    mockCourseReviewRepo.findById.mockResolvedValue(fakeCourse);

    await expect(courseReviewService.getCourseDetailForReview('c1')).resolves.toEqual(fakeCourse);
  });
});

describe('approveCourse', () => {
  test('throws when course is not found', async () => {
    mockCourseReviewRepo.findById.mockResolvedValue(null);

    await expect(courseReviewService.approveCourse('bad-id', 'admin1')).rejects.toThrow('Kh');
  });

  test('throws when course is not published', async () => {
    mockCourseReviewRepo.findById.mockResolvedValue({ _id: 'c1', status: 'draft', reviewStatus: 'pending' });

    await expect(courseReviewService.approveCourse('c1', 'admin1')).rejects.toThrow('Chi co the duyet');
  });

  test('throws when course is not pending', async () => {
    mockCourseReviewRepo.findById.mockResolvedValue({ _id: 'c1', status: 'published', reviewStatus: 'approved' });

    await expect(courseReviewService.approveCourse('c1', 'admin1')).rejects.toThrow('pending');
  });

  test('approves pending published course', async () => {
    const updated = { _id: 'c1', reviewStatus: 'approved' };
    mockCourseReviewRepo.findById.mockResolvedValue({ _id: 'c1', status: 'published', reviewStatus: 'pending' });
    mockCourseReviewRepo.approveCourse.mockResolvedValue(updated);

    await expect(courseReviewService.approveCourse('c1', 'admin1')).resolves.toEqual(updated);
    expect(mockCourseReviewRepo.approveCourse).toHaveBeenCalledWith('c1', 'admin1');
  });
});

describe('rejectCourse', () => {
  test('throws when course is not published', async () => {
    mockCourseReviewRepo.findById.mockResolvedValue({ _id: 'c1', status: 'draft', reviewStatus: 'pending' });

    await expect(courseReviewService.rejectCourse('c1', 'admin1', 'ly do')).rejects.toThrow('Chi co the tu choi');
  });

  test('throws when rejection reason is blank', async () => {
    mockCourseReviewRepo.findById.mockResolvedValue({ _id: 'c1', status: 'published', reviewStatus: 'pending' });

    await expect(courseReviewService.rejectCourse('c1', 'admin1', '')).rejects.toThrow('L');
  });

  test('rejects pending published course', async () => {
    const updated = { _id: 'c1', reviewStatus: 'rejected' };
    mockCourseReviewRepo.findById.mockResolvedValue({ _id: 'c1', status: 'published', reviewStatus: 'pending' });
    mockCourseReviewRepo.rejectCourse.mockResolvedValue(updated);

    await expect(courseReviewService.rejectCourse('c1', 'admin1', 'Noi dung chua dat')).resolves.toEqual(updated);
    expect(mockCourseReviewRepo.rejectCourse).toHaveBeenCalledWith('c1', 'admin1', 'Noi dung chua dat');
  });
});
