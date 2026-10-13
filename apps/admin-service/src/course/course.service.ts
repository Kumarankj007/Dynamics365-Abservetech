import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, ArrayContains } from 'typeorm';
import { Repository } from 'typeorm';
import { Course } from 'libs/database/src/entities/course.entity';
import { Status } from 'libs/access/src/enums/course.enum'
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { CourseApprovalDto, CreateAdminReplyDto, EditReviewDto } from './dto/course.dto';
import { Role } from 'libs/access/src/enums/roles.enum';
import { Category } from 'libs/database/src/entities/category.entity';
import { SubCategory } from 'libs/database/src/entities/subcategory.entity';
import { DurationBand } from 'libs/database/src/entities/durationband.entity';
import { Tag } from 'libs/database/src/entities/tags.entity';
import { User } from 'libs/database/src/entities/user.entity';
import { CourseReview } from 'libs/database/src/entities/course-review.entity';
import { Admin } from 'libs/database/src/entities/admin.entity';


@Injectable()
export class CourseService {
constructor(
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,
  @InjectRepository(Course)
  private readonly courseRepository: Repository<Course>,
  @InjectRepository(CourseReview)
  private readonly courseReviewRepository: Repository<CourseReview>,
  @InjectRepository(Category)
  private readonly categoryRepository: Repository<Category>,
  @InjectRepository(SubCategory)
  private readonly subCategoryRepository: Repository<SubCategory>,
  @InjectRepository(DurationBand)
  private readonly durationRepository: Repository<DurationBand>,
  @InjectRepository(Tag)
  private readonly tagRepository: Repository<Tag>,
) {}



  async getAllCourses(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 10 } = paginationDto;

      const [courses, total] = await this.courseRepository.findAndCount({
        where: { softDel: false },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

        const instructors = await this.userRepository.find({
          where: {
            role: ArrayContains([Role.INSTRUCTOR]),
            softDel: false,
          },
          select: ['id'],
        });

        const instructorIds = instructors.map(i => i.id);

        const [ publishedCount, inReviewCount, changesRequestedCount, draftCount] = await Promise.all([
          this.courseRepository.count({
            where: { status: Status.PUBLISHED, softDel: false,  creatorId: In(instructorIds) },
          }),
          this.courseRepository.count({
            where: { status: Status.IN_REVIEW, softDel: false,  creatorId: In(instructorIds) },
          }),
          this.courseRepository.count({
            where: { status: Status.CHANGES_REQUESTED, softDel: false,  creatorId: In(instructorIds) },
          }),
          this.courseRepository.count({
            where: { status: Status.DRAFT, softDel: false,  creatorId: In(instructorIds) },
          }),
      ]);


      const categoryIds = [...new Set(courses.map(c => c.categoryId).filter(Boolean))];
      const subCategoryIds = [...new Set(courses.map(c => c.subCategoryId).filter(Boolean))];
      const durationIds = [...new Set(courses.map(c => c.approximateDuration).filter(Boolean))];
      const tagIds = [...new Set(courses.flatMap(c => c.suggestedTags || []))];
      const creatorIds = [...new Set(courses.map(c => c.creatorId).filter(Boolean))];

      const [categories, subCategories, durations, tags, creators] = await Promise.all([
        this.categoryRepository.find({ where: { id: In(categoryIds) } }),
        this.subCategoryRepository.find({ where: { id: In(subCategoryIds) } }),
        this.durationRepository.find({ where: { id: In(durationIds) } }),
        this.tagRepository.find({ where: { id: In(tagIds) } }),
        this.userRepository.find({
          where: { id: In(creatorIds), softDel: false },
          select: [
            'id',
            'fullname',
            'email',
            'profile',
            'professionalTitle',
            'location',
            'website',
            'bio',
            'yearsOfExperience',
            'areasOfExpertise'
          ]
        }),
      ]);

      const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));
      const subCategoryMap = Object.fromEntries(subCategories.map(s => [s.id, s]));
      const durationMap = Object.fromEntries(durations.map(d => [d.id, d]));
      const tagMap = Object.fromEntries(tags.map(t => [t.id, t]));
      const creatorMap = Object.fromEntries(creators.map(u => [u.id, u]));

    const enrichedCourses = courses.map(course => ({
      ...course,
      category: course.categoryId ? categoryMap[course.categoryId] : null,
      subCategory: course.subCategoryId ? subCategoryMap[course.subCategoryId] : null,
      approximateDurationEntity: course.approximateDuration ? durationMap[course.approximateDuration] : null,
      suggestedTags: (course.suggestedTags || [])
        .map(tagId => tagMap[tagId] || null)
        .filter(Boolean),
      creator: course.creatorId ? creatorMap[course.creatorId] : null,
    })).filter(course => course.creator != null)


      return {
        status: true,
        statusCode: 200,
        message: 'Courses fetched successfully',
        data: {
          total,
          page,
          limit,
          statusCounts: {
            published: publishedCount,
            inReview: inReviewCount,
            changesRequested: changesRequestedCount,
            draft: draftCount,
          },
          data: enrichedCourses,
        },
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      )
        throw error;
      throw new InternalServerErrorException(error.message);
    }
  }


  async updateStatus(id: string, dto: CourseApprovalDto) {
    try {
      const course = await this.courseRepository.findOne({ where: { id } });
      if (!course) throw new NotFoundException('Course not found');
  
      course.status = dto.status;

      await this.courseRepository.save(course);
      return {
        status: true,
        message: `Course status updated to ${dto.status}`,
        data: course,
      };
    } catch (error: any) {
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteCourse(courseId: string ) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id: courseId, softDel: false },
      });

      if (!course) throw new NotFoundException('Course not found');

      course.softDel = true;
      await this.courseRepository.save(course);

      return { 
        status: true,
        statusCode: 200,
        message: 'Course deleted successfully' 
      };

    } catch (error: any) {
      console.error('Error deleting course:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async validateCourse(courseId: string) {
  try {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, softDel: false },
    });

    if (!course) throw new NotFoundException("Course not found");

    const missingFields: string[] = [];

    if (!course.title) missingFields.push("title");
    if (!course.description) missingFields.push("description");
    if (!course.approximateDuration) missingFields.push("approximateDuration");
    if (!course.categoryId) missingFields.push("categoryId");
    if (!course.subCategoryId) missingFields.push("subCategoryId");
    if (!course.introVideoUrl) missingFields.push("introVideoUrl");
    if (!course.creatorId) missingFields.push("creatorId");

    if (!course.pricingOptions || course.pricingOptions.length === 0) {
      missingFields.push("pricingOptions");
    }

    // Learning outcomes
    if (!course.learningOutcomes || course.learningOutcomes.length === 0) {
      missingFields.push("learningOutcomes");
    }

    // Curriculum check
    if (!course.curriculum || course.curriculum.length === 0) {
      missingFields.push("curriculum");
    } else {
      course.curriculum.forEach((section, index) => {
        if (!section.title)
          missingFields.push(`curriculum[${index}].title`);
        if (!section.lectures || section.lectures.length === 0)
          missingFields.push(`curriculum[${index}].lectures`);

        // lecture-level validation
        section.lectures?.forEach((lec, lecIndex) => {
          if (!lec.title)
            missingFields.push(`curriculum[${index}].lectures[${lecIndex}].title`);
          if (!lec.contentType)
            missingFields.push(`curriculum[${index}].lectures[${lecIndex}].contentType`);
        });
      });
    }

    const isCompleted = missingFields.length === 0;

    return {
      status: true,
      statusCode: 200,
      isCompleted,
      missingFields,
      message: isCompleted
        ? "Course is fully completed"
        : "Course is incomplete. Some fields are missing.",
    };
  } catch (error: any) {
    console.error("Course Validation Error:", error);
    throw new InternalServerErrorException(error.message);
  }
  }


  async addReplyToReview( id: string, dto: CreateAdminReplyDto, userId: string) {
      try {
          const review = await this.courseReviewRepository.findOne({ where: { id: id, softDel: false }});
  
          if (!review) {
            throw new NotFoundException('Review not found');
          }
  
          const newReply: any = {
            userId: userId,
            userType: Role.ADMIN,
            response: dto.response,
            dateOfReview: new Date().toISOString(),
          };
  
          if (!review.replies) {
            review.replies = [];
          }
  
          review.replies.push(newReply);
  
          await this.courseReviewRepository.save(review);
  
          return {
            status: true,
            statusCode: 200,
            message: 'Reply added successfully',
            data: newReply,
          };
      } catch (error: any) {
            console.error('Error adding reply to a reviews:', error);
            if ( error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException(error.message);
      }
  }

  async getAllReviews( paginationDto: PaginationDto ) {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const skip = (page - 1) * limit;
      
      const courses = await this.courseRepository.find({
        where: {softDel: false },
      }); 

      const courseIds = courses.map((c) => c.id);

      if (!courseIds.length) {
        return { totalReviews: 0, page, limit, reviews: [] };
      }

      const totalReviews = await this.courseReviewRepository
        .createQueryBuilder('r')
        .innerJoin(Course, 'c', 'c.id = r.courseId')
        .where('r.courseId IN (:...courseIds)', { courseIds })
        .andWhere('r.softDel = false')
        .getCount();

      const reviews = await this.courseReviewRepository
        .createQueryBuilder('r')
        .innerJoin(Course, 'c', 'c.id = r.courseId')
        .innerJoin(User, 'u', 'u.id = r.userId')
        .where('r.courseId IN (:...courseIds)', { courseIds })
        .andWhere('r.softDel = false')
        .select([
          'r.id AS id',
          'r.title AS title',
          'r.review AS review',
          'r.rating AS rating',
          'r.replies AS replies',
          'r.status AS status',
          'r.createdAt AS createdAt',

          'c.id AS courseId',
          'c.title AS courseTitle',

          'u.id AS userId',
          'u.fullname AS userName',
          'u.email AS userEmail',
          'u.profile AS userProfile',
        ])
        .orderBy('r.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getRawMany();

      return {
        status: true,
        statusCode: 200,
        message: 'Reviews fetched successfully',
        page,
        limit,
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit),
        reviews,
      };
    } catch (error: any) {
        console.error('Error fetching instructor reviews:', error);
        if ( error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message);
    }
  }

  async getReviewById(id: string) {
    try {
      const review = await this.courseReviewRepository.findOne({
        where: { id, softDel: false },
      });

      if (!review) throw new NotFoundException('Review not found');

      return {
        status: true,
        statusCode: 200,
        message: 'Review fetched successfully',
        data: review,
      };
    } catch (error: any) {
          console.error('Error fetching review:', error);
          if ( error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
          throw new InternalServerErrorException(error.message);
    }
  }

  async editReview(reviewId: string, dto: EditReviewDto) {
  try {
    const review = await this.courseReviewRepository.findOne({
      where: { id: reviewId, softDel: false },
    });

    

    if (!review) throw new NotFoundException('Review not found');

    if (dto.title !== undefined) review.title = dto.title;
    if (dto.review !== undefined) review.review = dto.review;
    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.status !== undefined) review.status = dto.status;


    review.updatedAt = new Date();

    const reviewed = await this.courseReviewRepository.save(review);

    return {
      status: true,
      statusCode: 200,
      message: 'Review updated successfully',
      data: reviewed,
    };
  } catch (error: any) {
    console.error('Error editing review:', error);
    throw new InternalServerErrorException(error.message);
  }
  }

  async updateCourseRating(courseId: string) {
    const reviews = await this.courseReviewRepository.find({
      where: { courseId, softDel: false },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2),
          )
        : 0;

    await this.courseRepository.update(courseId, {
      totalReviews,
      averageRating,
    });

    return true;
  }

  async deleteReview(id: string ) {
    try {

      const review = await this.courseReviewRepository.findOne({
        where: { id, softDel: false },
      });

      if (!review) throw new NotFoundException('Review not found');

      review.softDel = true;
      await this.courseReviewRepository.save(review);

      await this.updateCourseRating(review.courseId);

      return { 
        status: true,
        statusCode: 200,
        message: 'Review deleted successfully' 
      };

    } catch (error: any) {
      console.error('Error deleting review:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }





}
