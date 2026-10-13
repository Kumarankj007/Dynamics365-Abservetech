import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { In } from 'typeorm';
import axios from 'axios';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { ContentType, PaymentStatus, AttachmentFileType, SubscriptionStatus} from 'libs/access/src/enums/course.enum';
import { MailHelper } from 'libs/common/src/utils/mail/mailer.helper';
import { Course } from 'libs/database/src/entities/course.entity';
import { CourseReview } from 'libs/database/src/entities/course-review.entity';
import { Category } from 'libs/database/src/entities/category.entity';  
import { SubCategory } from 'libs/database/src/entities/subcategory.entity';
import { DurationBand } from 'libs/database/src/entities/durationband.entity';
import { Tag } from 'libs/database/src/entities/tags.entity'; 
import { User } from 'libs/database/src/entities/user.entity';
import { AwsUploadService } from 'libs/common/src/uploads/aws/aws-uploads.service';
import { StripePaymentService } from 'libs/common/src/payments/stripe.service';
import { Role } from 'libs/access/src/enums/roles.enum';
import { Status, PricingOption, ReviewStatus } from 'libs/access/src/enums/course.enum'
import { CreateTitleDto, AddLearningOutcomesDto, AddCourseDescriptionDto, AddCourseModuleDto, AddCoursePricingDto, CreateCourseReviewDto, CreateInstructorReplyDto } from './dto/courses.dto';
import { Enrollment } from 'libs/database/src/entities/enrollments.entity';
import { Roles } from 'libs/access/src/decorators/roles.decorator';
import { Admin } from 'libs/database/src/entities/admin.entity';
import { Settings } from 'libs/database/src/entities/settings.entity';
import { RazorpayPaymentService } from 'libs/common/src/payments/razorpay.service';
import { PaypalPaymentService } from 'libs/common/src/payments/paypal.service';

@Injectable()
export class CourseService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  constructor(
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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,    
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    private readonly stripePaymentService: StripePaymentService,
    private readonly razorpayPaymentService: RazorpayPaymentService,
    private readonly paypalPaymentService: PaypalPaymentService,
    private readonly mailHelper: MailHelper,
    private readonly awsUploadService: AwsUploadService
  ) {}

  private async applyCourseUpdate(course: Course, newData: Partial<Course>) {
    let message = ''
    if(course.status !== Status.DRAFT && course.status !== Status.IN_REVIEW) {
      course.draftData = {
        ...course.draftData,
        ...newData
      }
      course.hasPendingChanges = true
      course.editStatus = Status.AWAITING
      course.status = Status.PUBLISHED
      message = 'Changes submitted for approval'
    } else {
      Object.assign(course, newData)
      message = 'Course updated successfully'
    }
    return { course, message }
  }

  async addTitle(dto: CreateTitleDto, creatorId: string) {
    try {
        const existing = await this.courseRepository.findOne({ where: { title: dto.title, status: Status.PUBLISHED } });
        if (existing) throw new BadRequestException('Title already registered');

        const course = this.courseRepository.create({
          title: dto.title,
          creatorId,
          status: Status.DRAFT,
        });
        

        const newCourse = await this.courseRepository.save(course);
        console.log("new course", newCourse);
        

        return {
          status: true,
          statusCode: 201,
          message: 'Course title successfully created',
          data: newCourse,
        };
    } catch (error: any) {         
      console.error('---------error', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async addLearningOutcomes(courseId: string, dto: AddLearningOutcomesDto, userId: string, role: Role) {
    try {
        const course = await this.courseRepository.findOne({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');
        
        if (role != Role.ADMIN && course.creatorId !== userId) {
          throw new UnauthorizedException('You are not allowed to modify this course');
        }

        const { course: updatedCourse, message } = await this.applyCourseUpdate(course, { learningOutcomes: dto.outcomes })

/*         if(role == Role.ADMIN) course.status = Status.DRAFT
        if (course.status !== Status.DRAFT && course.status !== Status.CHANGES_REQUESTED && role != Role.ADMIN) throw new BadRequestException('Only draft and change requested courses can be edited.'); */
       
        // const existingOutcomes = course.learningOutcomes || [];
        // const combined = [...existingOutcomes, ...dto.outcomes];

/*         course.learningOutcomes = dto.outcomes; */

        const savedCourse = await this.courseRepository.save(updatedCourse);

        return {
          status: true,
          statusCode: 200,
          /* message: 'Learning outcomes added successfully', */
          message,
          /* data: savedCourse */
          data: {
            ...savedCourse,
            draftData: savedCourse.draftData || null,
            hasPendingChanges: savedCourse.hasPendingChanges
          }
        };
    } catch (error: any) {
        console.log("---------error", error)
        if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
        throw new InternalServerErrorException(error.message);
    }
  }

  async addCourseDescription(courseId: string, dto: AddCourseDescriptionDto, creatorId: string, role: Role) {
    try {
        const course = await this.courseRepository.findOne({ where: { id: courseId } });

        if (!course) throw new NotFoundException('Course not found');
        
        if (role != Role.ADMIN && course.creatorId !== creatorId) throw new UnauthorizedException('You are not authorized to modify this course');

        const newData = {
          description: dto.description,
          approximateDuration: dto.approximateDuration,
          categoryId: dto.categoryId,
          subCategoryId: dto.subCategoryId,
          suggestedTags: dto.suggestedTags || [],
          customTags: dto.customTags || []
        }
        console.log("newData", newData);
        

        const { course: updatedCourse, message } = await this.applyCourseUpdate(course, newData)
        const savedCourse = await this.courseRepository.save(updatedCourse);
/*         if(role == Role.ADMIN) course.status = Status.DRAFT
        if (course.status !== Status.DRAFT && course.status !== Status.CHANGES_REQUESTED && role != Role.ADMIN) throw new BadRequestException('Only draft and change requested courses can be edited.'); */
        
/*         course.description = dto.description;
        course.approximateDuration = dto.approximateDuration;
        course.categoryId = dto.categoryId;
        course.subCategoryId = dto.subCategoryId;
        course.suggestedTags = dto.suggestedTags || [];
        course.customTags = dto.customTags || [];

        await this.courseRepository.save(course);

        const suggestedTags = course.suggestedTags?.length > 0 ? await this.tagRepository.find({ where: { id: In(course.suggestedTags) } }) : [];
        const category = course.categoryId ? await this.categoryRepository.findOne({ where: { id: course.categoryId } }) : null;
        const subCategory = course.subCategoryId ? await this.subCategoryRepository.findOne({ where: { id: course.subCategoryId } }) : null;
        const approximateDuration = course.approximateDuration ? await this.durationRepository.findOne({ where: { id: course.approximateDuration } }) : null; */
        

        return {
          status: true,
          statusCode: 200,
          // message: 'Course description added successfully',
          message,
          data: {
            ...savedCourse,
            draftData: savedCourse.draftData || null,
            hasPendingChanges: savedCourse.hasPendingChanges,
/*             ...course,
            suggestedTags,
            category,
            subCategory,
            approximateDurationEntity: approximateDuration */
          },
        };
    } catch (error: any) {
        console.log("---------error", error)
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message); 
    }
  }

 async uploadLectureVideo(file: Express.Multer.File, folderType?: string) {
  try {
      const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/x-matroska', 'video/webm', 'video/x-msvideo', 'video/x-ms-wmv', 'video/mpeg', 'video/ogg'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid file type. Only video files are allowed.');
      }
      const settings = await this.settingsRepository.find({
        order: { id: "ASC" },
        take: 1,
      }).then(res => res[0]);

      const key = await this.awsUploadService.uploadFile(file, folderType);
      
      const fileUrl = `https://${settings?.awsBucketName}.s3.${settings?.awsRegion}.amazonaws.com/${key}`;

      return {
        status: true,
        statusCode: 200,
        message: 'Video uploaded successfully',
        data: fileUrl
      };
  } catch (error: any) {
    console.error('S3 Upload Error:', error);
    if (error instanceof BadRequestException) throw error;
    throw new InternalServerErrorException('Error uploading video to AWS S3');
  }
 }

  async uploadLectureAttachment(file: Express.Multer.File, folderType ?: string) {
    try {
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only PDF, Word, and Excel files are allowed.',
        );
      }

      const ext = file.originalname.split('.').pop()?.toLowerCase();
      if (!ext) {
        throw new BadRequestException('Unable to determine file extension');
      }

      const extensionToTypeMap: Record<string, AttachmentFileType> = {
        pdf: AttachmentFileType.PDF,
        doc: AttachmentFileType.DOC,
        docx: AttachmentFileType.DOCX,
        xls: AttachmentFileType.XLS,
        xlsx: AttachmentFileType.XLSX,
      };

      const fileType = extensionToTypeMap[ext];
      if (!fileType) {
        throw new BadRequestException('Unsupported attachment format');
      }

      const settings = await this.settingsRepository.find({
        order: { id: "ASC" },
        take: 1,
      }).then(res => res[0]);

      const key = await this.awsUploadService.uploadFile(file, folderType);

      const fileUrl = `https://${settings?.awsBucketName}.s3.${settings?.awsRegion}.amazonaws.com/${key}`;

      return {
        status: true,
        statusCode: 200,
        message: 'Attachment uploaded successfully',
        data: {
          name: file.originalname,
          fileUrl,
          fileType,
          size: file.size,
          uploadedAt: new Date(),
        },
      };
    } catch (error) {
      console.error('Attachment Upload Error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error uploading attachment to AWS S3');
    }
  }

  getStripeInterval(option: PricingOption): { interval: 'month' | 'year'; count: number } | null {
    switch (option) {
      case PricingOption.ONE_MONTH:
        return { interval: 'month', count: 1 };

      case PricingOption.SIX_MONTHS:
        return { interval: 'month', count: 6 };

      case PricingOption.ONE_YEAR:
        return { interval: 'year', count: 1 };

      default:
        return null;
    }
  }

  getRazorpayInterval(option: PricingOption): { interval: 'monthly' | 'yearly'; count: number } | null {
    switch (option) {
      case PricingOption.ONE_MONTH:
        return { interval: 'monthly', count: 1 }

      case PricingOption.SIX_MONTHS:
        return { interval: 'monthly', count: 6 }

      case PricingOption.ONE_YEAR:
        return { interval: 'yearly', count: 1 }

      default:
        return null
    }
  }

  getPaypalInterval(option: PricingOption): { interval: 'MONTH' | 'YEAR'; count: number } | null {
    switch (option) {
      case PricingOption.ONE_MONTH:
        return { interval: 'MONTH', count: 1 }

      case PricingOption.SIX_MONTHS:
        return { interval: 'MONTH', count: 6 }

      case PricingOption.ONE_YEAR:
        return { interval: 'YEAR', count: 1 }

      default:
        return null
    }
  }



  async addCourseCurriculum( courseId: string, modules: AddCourseModuleDto[], userId: string, role: Role) {
    try {
      const course:any = await this.courseRepository.findOne({
        where: { id: courseId },
      });

      if (!course) {
        throw new NotFoundException('Course not found or not authorized.');
      }

/*       if (role != Role.ADMIN && course.creatorId !== userId) throw new UnauthorizedException('You are not authorized to modify this course');
      if(role == Role.ADMIN) course.status = Status.DRAFT */

      const formattedModules = modules.map((module, mIndex) => ({
        title: module.title || '',
        description: module.description || '',
        order: mIndex + 1,
        lectures: module.lectures!.map((lecture, lIndex) => ({
          id: uuidv4(),
          title: lecture.title || '',
          order: lIndex + 1,
          contentType: lecture.contentType!,
          videoUrl: lecture.videoUrl,
          fileUrl: lecture.fileUrl,
          duration: lecture.duration,
          attachments: lecture.attachments || [],
        })),
      }));

      const { course: updatedCourse, message } = await this.applyCourseUpdate(course, { curriculum: formattedModules })

      const savedCourse = await this.courseRepository.save(updatedCourse)

/*       course.curriculum = modules.map((module, mIndex) => ({
        title: module.title,
        description: module.description,
        order: mIndex + 1,
        lectures: module.lectures!.map((lecture, lIndex) => ({
          id: uuidv4(),
          title: lecture.title,
          order: lIndex + 1,
          contentType: lecture.contentType,
          ...(lecture.fileUrl ? { fileUrl: lecture.fileUrl } : {}),
          ...(lecture.videoUrl ? { videoUrl: lecture.videoUrl } : {}),
          duration: lecture.duration,
          ...(lecture.attachments?.length
          ? {
              attachments: lecture.attachments.map((att) => ({
                name: att.name,
                fileUrl: att.fileUrl,
                fileType: att.fileType,
              })),
            }
          : {}),
        })),
      }));

      await this.courseRepository.save(course); */

      return {
        status: true,
        statusCode: 200,
        /* message: 'Course curriculum added successfully', */
        message,
        data: {
          ...savedCourse,
          draftData: savedCourse.draftData || null,
          hasPendingChanges: savedCourse.hasPendingChanges,
        }
      };
    } catch (error: any) {
      console.error('Error adding course curriculum:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async addCoursePricing(courseId: string, dto: AddCoursePricingDto, creatorId: string, role: Role) {
    try {
      const course: any = await this.courseRepository.findOne({ where: { id: courseId } });
      if (!course) throw new NotFoundException('Course not found');

      if (role != Role.ADMIN && course.creatorId !== creatorId) {
        throw new UnauthorizedException('You are not authorized to modify this course');
      }
      /*       if(role == Role.ADMIN) course.status = Status.DRAFT
            if (course.status !== Status.DRAFT && course.status !== Status.CHANGES_REQUESTED && role != Role.ADMIN) throw new BadRequestException('Only draft and change requested courses can be edited.'); */

      /*       if (dto.introVideoUrl) {
              course.introVideoUrl = dto.introVideoUrl;
            }
            if (dto.introDuration) {
              course.introDuration = dto.introDuration;
            } */

      if (!Array.isArray(dto.pricingOptions)) {
        throw new BadRequestException('Invalid pricing options');
      }

      const pricingOptions = await Promise.all(
        dto.pricingOptions.map(async (option) => {
          console.log("option", option);
          
          if (!option.option) {
            throw new BadRequestException('Pricing option is required');
          }
          if (option.price == null) {
            throw new BadRequestException('Price is required');
          }

          let stripePriceId = option.stripePriceId;
          let razorpayPlanId = option.razorpayPlanId
          let paypalPlanId = option.paypalPlanId

          if (option.option !== PricingOption.LIFETIME) {
            const intervalConfig = this.getStripeInterval(option.option);
            if (!intervalConfig) {
              throw new BadRequestException(`Invalid pricing option: ${option.option}`);
            }

            if (!stripePriceId) {
              stripePriceId = await this.stripePaymentService.createStripePrice(
                course.title!,
                option.option,
                option.price,
                intervalConfig.interval,
                intervalConfig.count
              );
            }

            if (!paypalPlanId) {
              const paypalInterval = this.getPaypalInterval(option.option)
              if (!paypalInterval) {
                throw new BadRequestException(`Invalid pricing option: ${option.option}`);
              }

              // PayPal is optional/dormant until credentials are configured in settings.
              // If it isn't set up yet, skip plan creation so course saving still works
              // (paypalPlanId stays empty; PayPal checkout will report it when actually used).
              try {
                const productId = await this.paypalPaymentService.createProduct(course.title!)
                // PayPal is charged in USD, same as Stripe pricing.
                paypalPlanId = await this.paypalPaymentService.createPlan({
                  productId,
                  courseTitle: course.title!,
                  planOption: option.option,
                  amount: option.price,
                  interval: paypalInterval.interval,
                  intervalCount: paypalInterval.count,
                  currency: 'USD',
                })
              } catch (err: any) {
                console.warn(`PayPal plan not created for "${option.option}" (PayPal not configured?):`, err?.message ?? err)
              }
            }

            if (!razorpayPlanId) {
              const razorpayInterval = this.getRazorpayInterval(option.option)
              if (!razorpayInterval) {
                throw new BadRequestException(`Invalid pricing option: ${option.option}`);
              }

              const res = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD')
              const data = await res.json()
              const rate = parseFloat(data?.data?.rates?.['INR']);
              if (!rate) throw new InternalServerErrorException('Failed to fetch USD to INR rate');
              const priceInINR = Math.round(option.price * rate); // e.g. $2 → ₹184

              razorpayPlanId = await this.razorpayPaymentService.createPlan({
                courseTitle: course.title!,
                planOption: option.option,
                amount: priceInINR,
                interval: razorpayInterval.interval,
                intervalCount: razorpayInterval.count,
                currency: 'INR',
              });

            }
          }

          return {
            option: option.option,
            price: option.price,
            description: option.description || '',
            stripePriceId,
            razorpayPlanId,
            paypalPlanId
          };
        })
      );

      const { course: updatedCourse, message } = await this.applyCourseUpdate(course, {
        pricingOptions,
        introVideoUrl: dto.introVideoUrl,
        introDuration: dto.introDuration
      })

      const savedCourse = await this.courseRepository.save(updatedCourse);
      /*       if (Array.isArray(dto.pricingOptions) && dto.pricingOptions.length > 0) {
              course.pricingOptions = await Promise.all(
                dto.pricingOptions.map(async (option) => {
                  let stripePriceId = option.stripePriceId;
                  if (!option.option) throw new BadRequestException('Pricing option is required');
                  if (option.price == null) throw new BadRequestException('Price is required');
      
                  if (option.option !== PricingOption.LIFETIME && !stripePriceId) {
      
                    const intervalConfig = this.getStripeInterval(option.option);
      
                    if (!intervalConfig) { throw new BadRequestException( `Invalid pricing option: ${option.option}`) }
                      stripePriceId = await this.stripePaymentService.createStripePrice(
                        course.title,
                        option.option,           
                        option.price,            
                        intervalConfig.interval,  
                        intervalConfig.count    
                      );
                  }
      
                  return {
                    option: option.option,
                    price: option.price,
                    description: option.description || '',
                    stripePriceId,
                  };
                })
              );
            }
      
            await this.courseRepository.save(course); */


      return {
        status: true,
        statusCode: 200,
        /*  message: 'Course pricing and preview video added successfully', */
        message,
        data: {
          ...savedCourse,
          draftData: savedCourse.draftData || null,
          hasPendingChanges: savedCourse.hasPendingChanges
        }
      };
    } catch (error: any) {
      console.error('Error adding course pricing:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async approveCourseChanges(courseId: string/* , adminId: string */) {
    try {
      const course = await this.courseRepository.findOne({ where: { id: courseId } });
      if (!course) {
        throw new NotFoundException('Course not found');
      }

      if (!course.draftData) {
        throw new BadRequestException('No pending changes to approve');
      }

      Object.assign(course, course.draftData);

      course.draftData = null;
      course.hasPendingChanges = false;
      course.editStatus = Status.NO_CHANGES


      course.status = Status.PUBLISHED;

      const savedCourse = await this.courseRepository.save(course);
      return {
        status: true,
        statusCode: 200,
        message: 'Course changes approved successfully',
        data: savedCourse,
      };

    } catch (error: any) {
      console.error('Error approving course changes:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async toggleCourseAvailability(courseId: string) {
    try {
      const course = await this.courseRepository.findOne({ where: { id: courseId }})
      if(!course) throw new BadRequestException('Course not found');

      course.courseAvailability = !course.courseAvailability

      const savedCourse = await this.courseRepository.save(course)

      return {
        status: true,
        statusCode: 200,
        message: `Course ${savedCourse.courseAvailability ? 'enabled' : 'disabled'} successfully`, 
        data: savedCourse
      }
    } catch (error: any) {
      console.error('Error toggling course availability:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async submitCourse(courseId: string, userId: string, userRole: Role ) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id: courseId, /* creatorId: userId, */ softDel: false },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }
      // if (course.status !== Status.DRAFT && course.status !== Status.CHANGES_REQUESTED) throw new BadRequestException('Only draft and change requested courses can be edited.');

      if (Array.isArray(userRole) && userRole.includes(Role.ADMIN)) {
        course.status = Status.PUBLISHED;
      } else if(Array.isArray(userRole) && userRole.includes(Role.INSTRUCTOR)) {
        if(course.status == Status.PUBLISHED) {
          course.status = Status.PUBLISHED
        } else course.status = Status.IN_REVIEW;
      }


      course.editStatus = Status.COMPLETED
      await this.courseRepository.save(course);

      if (course.status === Status.IN_REVIEW) {

        const creator = await this.userRepository.findOne({
          where: { id: course.creatorId, softDel: false },
          select: ['fullname', 'email'],
        });

        const admins = await this.adminRepository.find({
          where: { softDel: false },
          select: ['email', 'name'],
        });


        for (const admin of admins) {
          this.mailHelper
            .sendTemplateMail(
              'ADMIN_COURSE_SUBMISSION',
              admin.email!,
              {
                courseTitle: course.title!,
                creatorName: creator?.fullname || 'Course Creator',
                creatorEmail: creator?.email || '-',
              },
            )
            .catch(err => {
              console.error('Admin notification mail failed:', err);
            });
        }
    }

      return {
        status: true,
        statusCode: 200,
        message: 'Course submitted successfully',
        courseId: course.id,
      };
    } catch (error: any) {
      console.error('Error submitting course:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async getActiveCourse(userId: string) {
      try {
        const draft = await this.courseRepository.findOne({
          where: { creatorId: userId, status: Status.DRAFT, softDel: false },
        });
  
        if (!draft) {
        throw new NotFoundException('No Active Course Found');
      }
  
        return {
          status: true,
          statusCode: 200,
          message: 'Active draft fetched successfully',
          data: draft,
        };
      } catch (error: any) {
          console.error('Error fetching courses:', error);
          if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
          throw new InternalServerErrorException(error.message);
      }
  }

  async myCourses(paginationDto: PaginationDto,userId: string) {
      try {

        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const [courses, total] = await this.courseRepository.findAndCount({
          where: { creatorId: userId, softDel: false },
          order: { createdAt: 'DESC' },
          skip: skip,
          take: limit,
        });

        const userDetail = await this.adminRepository.findOne({ where: { id: userId } })
        
        return {
          status: true,
          statusCode: 200,
          message: 'My Courses fetched successfully',
          data: {
            total,
            page,
            limit,
            data: courses,
          },
        };
      } catch (error: any) {
        console.error('Error fetching active course:', error);
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message);
      }
  }

  async deleteCourse(userId: string, courseId: string ) {
    try {

      const course = await this.courseRepository.findOne({
        where: { id: courseId, creatorId: userId, softDel: false },
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

 async myCourseDetail(courseId: string, userId: string) {
  try {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, softDel: false, /* creatorId: userId */ },
    });

    if (!course) throw new NotFoundException('Course not found');
    console.log("course details===", course);
    const draft = course.draftData || {}
    const {
      creatorId,
      categoryId,
      subCategoryId,
      approximateDuration,
      suggestedTags = [],
      customTags = [],
    } = course;

     const [user, category, subCategory, duration, tags, draftCategory, draftSubCategory, draftDuration, draftTags] = await Promise.all([
      this.userRepository.findOne({ where: { id: creatorId } }) || this.adminRepository.findOne({ where: { id: creatorId } }),
      categoryId ? this.categoryRepository.findOne({ where: { id: categoryId } }) : null,
      subCategoryId ? this.subCategoryRepository.findOne({ where: { id: subCategoryId } }) : null,
      approximateDuration ? this.durationRepository.findOne({ where: { id: approximateDuration } }) : null,
      Array.isArray(suggestedTags) && suggestedTags.length > 0
        ? this.tagRepository.find({ where: { id: In(suggestedTags) } })
        : [],
      draft.categoryId ? this.categoryRepository.findOne({ where: { id: draft.categoryId } }) : null,
      draft.subCategoryId ? this.subCategoryRepository.findOne({ where: { id: draft.subCategoryId } }) : null,
      draft.approximateDuration ? this.durationRepository.findOne({ where: { id: draft.approximateDuration } }) : null,
      Array.isArray(draft.suggestedTags) && draft.suggestedTags.length > 0
        ? this.tagRepository.find({ where: { id: In(draft.suggestedTags) } })
        : [],
    ]);


    const curriculumArray = Array.isArray(course.curriculum)
      ? course.curriculum
      : [];

    const modulesCount = curriculumArray.length;
    const lessonsCount = curriculumArray.reduce(
      (sum, module) => sum + (Array.isArray(module.lectures) ? module.lectures.length : 0),
      0,
    );

    return {
      status: true,
      statusCode: 200,
      message: 'Course details fetched successfully',
      data: {
        id: course.id,
        title: course.title,
        description: course.description,
        category: category || null,
        subCategory: subCategory || null,
        approximateDurationEntity: duration || null,
        introVideoUrl: course.introVideoUrl,
        pricingOptions: Array.isArray(course.pricingOptions)
          ? course.pricingOptions
          : [],
        learningOutcomes: Array.isArray(course.learningOutcomes)
          ? course.learningOutcomes
          : [],
        curriculum: curriculumArray,
        totalReviews: course.totalReviews || 0,
        averageRating: course.averageRating || {
          ContentQuality: 0,
          InstructorClarity: 0,
          Practicality: 0,
          ValueForMoney: 0,
          Engagement: 0,
          overall: 0,
        },
        draftData: course.draftData ? {
          ...course.draftData,
          category: draftCategory || null,
          subCategory: draftSubCategory || null,
          approximateDurationEntity: draftDuration || null,
          suggestedTags: draftTags || [],
        } : null,
        editStatus: course.editStatus,
        hasPendingChanges: course.hasPendingChanges,
        suggestedTags: tags || [],
        customTags: Array.isArray(customTags) ? customTags : [],
        user: user || null,
        modulesCount,
        lessonsCount,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
    };
  } catch (error: any) {
    console.error('Error fetching course details:', error);
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    )
      throw error;
    throw new InternalServerErrorException(error.message);
  }
 }

  async getCourseDetails(courseId: string, userId?: string | null) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id: courseId, softDel: false, status: In([Status.PUBLISHED, Status.CHANGES_REQUESTED]), courseAvailability: true  },
      });

      if (!course) throw new NotFoundException('Course not found');

      const {
        creatorId,
        categoryId,
        subCategoryId,
        approximateDuration,
        suggestedTags = [],
      } = course;

      const [user, category, subCategory, duration, tags, reviews, enrollment] = await Promise.all([
        (async () => {
          const user = await this.userRepository.findOne({ where: { id: creatorId } })
          if(user) return user
          return this.adminRepository.findOne({ where: { id: creatorId } })
        })(),
        this.categoryRepository.findOne({ where: { id: categoryId } }),
        this.subCategoryRepository.findOne({ where: { id: subCategoryId } }),
        this.durationRepository.findOne({ where: { id: approximateDuration } }),
        suggestedTags?.length
          ? this.tagRepository.find({ where: { id: In(suggestedTags) } })
          : [],
        this.courseReviewRepository.find({ where: { courseId, softDel: false, status: ReviewStatus.PUBLISHED }, relations: ['user'], order: { createdAt: 'DESC' }}),
        userId ? this.enrollmentRepository.findOne({ where: { userId, courseId, paymentStatus: PaymentStatus.PAID }}) : null
   ]);

      const modulesCount = course.curriculum?.length || 0;
      const lessonsCount =
        course.curriculum?.reduce(
          (sum, module) => sum + (module.lectures?.length || 0),
          0,
        ) || 0;

      const isPurchased = !!enrollment && enrollment.paymentStatus == PaymentStatus.PAID && enrollment.subscriptionStatus == SubscriptionStatus.Active

      return {
        status: true,
        statusCode: 200,
        message: 'Course details fetched successfully',
        data: {
          id: course.id,
          title: course.title,
          description: course.description,
          category: category || null,
          subCategory: subCategory || null,
          approximateDurationEntity: duration || null,
          introVideoUrl: course.introVideoUrl,
          pricingOptions: course.pricingOptions || [],
          learningOutcomes: course.learningOutcomes || [],
          curriculum: course.curriculum || [],
          totalReviews: course.totalReviews || 0,
          averageRating: course.averageRating || {
            ContentQuality: 0,
            InstructorClarity: 0,
            Practicality: 0,
            ValueForMoney: 0,
            Engagement: 0,
            overall: 0,
          },
          suggestedTags: tags || [],
          user: user || null,
          modulesCount,
          lessonsCount,
          reviews: reviews || [],
          isEnrollment: !!enrollment,
          isPurchased,
          enrollmentDetails: enrollment || null,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        },
      };
    } catch (error: any) {
        console.error('Error fetching course details:', error);
        if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException(error.message);
    }
  }


  async getAllCourses(paginationDto: PaginationDto, type?: string, search?: string) {
  try {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.courseRepository.createQueryBuilder('course')
      .where('course.softDel = :softDel', { softDel: false })
      .andWhere('course.status IN (:...statuses)', { statuses: [Status.PUBLISHED, Status.CHANGES_REQUESTED] })
      .andWhere('course.courseAvailability = :courseAvailability', { courseAvailability: true })

    if (search) {
        query.andWhere(
          'course.title ILIKE :search',
          { search: `%${search.trim()}%` },
        );
    }

    if (type === 'newcourse') {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7); 

        query.andWhere('course.createdAt BETWEEN :weekAgo AND :today', {
          weekAgo: weekAgo.toISOString(),
          today: today.toISOString(),
        });
        query.orderBy('course.createdAt', 'DESC');
    } else if (type === 'toprated') {
      query.orderBy(`(course.averageRating->>'overall')::float`, 'DESC');
    } else {
      query.orderBy('course.createdAt', 'DESC');
    }

    query.skip(skip).take(limit);

    const [courses, total]: [Course[], number] = await query.getManyAndCount();

    const creatorIds = [...new Set(courses.map(c => c.creatorId).filter(Boolean))];
    const categoryIds = [...new Set(courses.map(c => c.categoryId).filter(Boolean))];
    const subCategoryIds = [...new Set(courses.map(c => c.subCategoryId).filter(Boolean))];
    const durationIds = [...new Set(courses.map(c => c.approximateDuration).filter(Boolean))];
    const tagIds = [...new Set(courses.flatMap(c => c.suggestedTags || []))];

    // ⚡ Fetch related data in parallel
    const [users, admins, categories, subCategories, durations, tags] = await Promise.all([
      this.userRepository.find({ where: { id: In(creatorIds) } }),
      this.adminRepository.find({ where: { id: In(creatorIds) } }),
      this.categoryRepository.find({ where: { id: In(categoryIds) } }),
      this.subCategoryRepository.find({ where: { id: In(subCategoryIds) } }),
      this.durationRepository.find({ where: { id: In(durationIds) } }),
      this.tagRepository.find({ where: { id: In(tagIds) } }),
    ]);

    const creatorMap = {
      ...Object.fromEntries(users.map(u => [u.id, u])),
      ...Object.fromEntries(admins.map(a => [a.id, a]))
    }
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));
    const subCategoryMap = Object.fromEntries(subCategories.map(s => [s.id, s]));
    const durationMap = Object.fromEntries(durations.map(d => [d.id, d]));
    const tagMap = Object.fromEntries(tags.map(t => [t.id, t]));

    const enrichedCourses = courses.map((course: Course) => ({
      ...course,
      user: creatorMap[course.creatorId!] || null,
      category: categoryMap[course.categoryId!] || null,
      subCategory: subCategoryMap[course.subCategoryId!] || null,
      approximateDurationEntity: durationMap[course.approximateDuration!] || null,
      suggestedTags: (course.suggestedTags || [])
        .map(tagId => tagMap[tagId] || null)
        .filter(Boolean),
    }));

    return {
      status: true,
      statusCode: 200,
      message: 'Courses fetched successfully',
      data: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: enrichedCourses,
      },
    };
  } catch (error: any) {
      console.error('Error fetching courses:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
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

  async createReview(userId: string, dto: CreateCourseReviewDto) {
    try {
        const course = await this.courseRepository.findOne({
        where: { id: dto.courseId, softDel: false },
      });

      if (!course) throw new NotFoundException('Course not found');

      const existing = await this.courseReviewRepository.findOne({
        where: { userId, courseId: dto.courseId, softDel: false },
      });

      if (existing)
        throw new BadRequestException('You have already reviewed this course');

      const review = this.courseReviewRepository.create({
        userId,
        courseId: dto.courseId,
        enrollmentId: dto.enrollmentId,
        title: dto.title,
        review: dto.review,
        rating: dto.rating,
        isReviewed: true,
      });

      await this.courseReviewRepository.save(review);
      await this.updateCourseRating(dto.courseId);

      return {
        status: true,
        statusCode: 200,
        message: 'Review added successfully',
        data: review,
      };

    } catch (error: any) {
      console.error('Error creating courses:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
    
  }

  async fetchReview(courseId: string, userId: string) {
    try {
      const review = await this.courseReviewRepository.findOne({
        where: { userId, courseId, softDel: false },
      });

      if (!review) throw new NotFoundException('Review not found');

      return { 
        status: true,
        statusCode: 200,
        message: 'Review fetched successfully',
        data: review
      };

    } catch (error: any) {
      console.error('Error deleting review:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteReview(userId: string, reviewId: string ) {
    try {

      const review = await this.courseReviewRepository.findOne({
        where: { id: reviewId, userId, softDel: false },
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

  async getAllReviewsForInstructor( paginationDto: PaginationDto, instructorId: string ) {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const skip = (page - 1) * limit;
      
      const courses = await this.courseRepository.find({
        where: { creatorId: instructorId, softDel: false },
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

  async addReplyToReview( reviewId: string, dto: CreateInstructorReplyDto, userId: string) {
    try {
        const review = await this.courseReviewRepository.findOne({ where: { id: reviewId, softDel: false }});

        if (!review) {
          throw new NotFoundException('Review not found');
        }

        const newReply: any = {
          userId: userId,
          userType: Role.INSTRUCTOR,
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



}
