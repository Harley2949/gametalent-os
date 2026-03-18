import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  addMinutes,
  addDays,
  isBefore,
  isAfter,
  setHours,
  setMinutes,
  isSameDay,
  startOfDay,
  endOfDay,
  differenceInMinutes,
} from 'date-fns';

export interface TimeSlot {
  start: Date;
  end: Date;
  score: number;
  reasons: string[];
}

export interface ScheduleRequest {
  applicationId: string;
  interviewerIds: string[];
  duration: number;
  startDate?: Date;
  endDate?: Date;
  candidateTimeZone?: string;
  preferredTimes?: string[]; // ['morning', 'afternoon']
}

export interface ScheduleSuggestion {
  interviewerId: string;
  timeSlots: TimeSlot[];
}

export interface AvailabilityResult {
  date: Date;
  availableSlots: TimeSlot[];
}

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get available time slots for smart scheduling
   * Returns 3 best time slot recommendations
   */
  async getScheduleSuggestions(request: ScheduleRequest): Promise<TimeSlot[]> {
    const { applicationId, interviewerIds, duration, startDate, endDate, preferredTimes } = request;

    // Validate application exists
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { candidate: true, job: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Set default date range (next 14 days)
    const searchStart = startDate || new Date();
    const searchEnd = endDate || addDays(new Date(), 14);

    // Get availability for all interviewers
    const interviewerAvailabilities = await this.getInterviewersAvailability(
      interviewerIds,
      searchStart,
      searchEnd,
    );

    // Find overlapping time slots
    const overlappingSlots = this.findOverlappingSlots(
      interviewerAvailabilities,
      duration,
      preferredTimes,
    );

    // Score and rank the slots
    const scoredSlots = await this.scoreTimeSlots(overlappingSlots, application);

    // Return top 3 suggestions
    return scoredSlots.slice(0, 3);
  }

  /**
   * Get user availability configuration
   */
  async getUserAvailability(userId: string) {
    let availability = await this.prisma.userAvailability.findUnique({
      where: { userId },
    });

    // Create default availability if not exists
    if (!availability) {
      availability = await this.prisma.userAvailability.create({
        data: {
          userId,
          workDays: [1, 2, 3, 4, 5],
          workStartAt: '09:00',
          workEndAt: '18:00',
          breakStartAt: '12:00',
          breakEndAt: '13:00',
          timezone: 'Asia/Shanghai',
          minNoticeHours: 2,
          maxBookingDays: 30,
          blackoutDates: [],
        },
      });
    }

    return availability;
  }

  /**
   * Update user availability configuration
   */
  async updateUserAvailability(userId: string, data: any) {
    return this.prisma.userAvailability.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  /**
   * Get available slots for a specific date range
   */
  async getAvailableSlots(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AvailabilityResult[]> {
    const availability = await this.getUserAvailability(userId);
    const existingInterviews = await this.getExistingInterviews(userId, startDate, endDate);

    const results: AvailabilityResult[] = [];
    const currentDate = startOfDay(startDate);
    const finalDate = endOfDay(endDate);

    while (isBefore(currentDate, finalDate)) {
      const daySlots = this.calculateDaySlots(currentDate, availability, existingInterviews);
      if (daySlots.length > 0) {
        results.push({
          date: currentDate,
          availableSlots: daySlots,
        });
      }
      // Add next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return results;
  }

  /**
   * Schedule an interview with suggested time slot
   */
  async scheduleInterview(data: {
    applicationId: string;
    interviewerId: string;
    title: string;
    description?: string;
    type: string;
    stage: string;
    scheduledAt: Date;
    duration: number;
    location?: string;
  }) {
    // Create interview
    const interview = await this.prisma.interview.create({
      data: {
        applicationId: data.applicationId,
        interviewerId: data.interviewerId,
        title: data.title,
        description: data.description,
        type: data.type as any,
        stage: data.stage as any,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        location: data.location,
      },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        interviewer: true,
      },
    });

    // Create invitation
    await this.createInterviewInvitation(interview.id);

    // Schedule reminders
    await this.scheduleReminders(interview);

    return interview;
  }

  /**
   * Reschedule an existing interview
   */
  async rescheduleInterview(
    interviewId: string,
    newScheduledAt: Date,
    reason?: string,
  ) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: { invitation: true, reminders: true },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // Update interview time
    const updated = await this.prisma.interview.update({
      where: { id: interviewId },
      data: { scheduledAt: newScheduledAt },
    });

    // Cancel existing reminders
    await this.prisma.interviewReminder.updateMany({
      where: { interviewId },
      data: { status: 'CANCELLED' },
    });

    // Reset invitation status
    if (interview.invitation) {
      await this.prisma.interviewInvitation.update({
        where: { id: interview.invitation.id },
        data: {
          status: 'PENDING',
          respondedAt: null,
        },
      });
    }

    // Schedule new reminders
    await this.scheduleReminders(updated);

    return updated;
  }

  /**
   * Confirm interview time (candidate response)
   */
  async confirmInterview(interviewId: string) {
    return this.prisma.interviewInvitation.update({
      where: { interviewId },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });
  }

  /**
   * Get calendar availability (for calendar integration)
   */
  async syncExternalCalendar(userId: string, provider: string) {
    // TODO: Implement external calendar sync
    // This will integrate with Google Calendar, Outlook, etc.
    return {
      message: 'Calendar sync not yet implemented',
      userId,
      provider,
    };
  }

  // ============== Private Helper Methods ==============

  /**
   * Get availability for multiple interviewers
   */
  private async getInterviewersAvailability(
    interviewerIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Map<string, TimeSlot[]>> {
    const availabilityMap = new Map<string, TimeSlot[]>();

    for (const interviewerId of interviewerIds) {
      const availabilities = await this.getAvailableSlots(interviewerId, startDate, endDate);
      const allSlots: TimeSlot[] = [];

      for (const availability of availabilities) {
        allSlots.push(...availability.availableSlots);
      }

      availabilityMap.set(interviewerId, allSlots);
    }

    return availabilityMap;
  }

  /**
   * Find overlapping time slots across all interviewers
   */
  private findOverlappingSlots(
    interviewerAvailabilities: Map<string, TimeSlot[]>,
    duration: number,
    preferredTimes?: string[],
  ): TimeSlot[] {
    const interviewerIds = Array.from(interviewerAvailabilities.keys());

    if (interviewerIds.length === 0) return [];

    // Start with first interviewer's slots
    let overlappingSlots = interviewerAvailabilities.get(interviewerIds[0]) || [];

    // Intersect with each subsequent interviewer
    for (let i = 1; i < interviewerIds.length; i++) {
      const otherSlots = interviewerAvailabilities.get(interviewerIds[i]) || [];
      overlappingSlots = this.intersectSlots(overlappingSlots, otherSlots, duration);
    }

    // Filter by preferred times if specified
    if (preferredTimes && preferredTimes.length > 0) {
      overlappingSlots = this.filterByPreferredTimes(overlappingSlots, preferredTimes);
    }

    return overlappingSlots;
  }

  /**
   * Intersect two sets of time slots
   */
  private intersectSlots(slots1: TimeSlot[], slots2: TimeSlot[], duration: number): TimeSlot[] {
    const result: TimeSlot[] = [];

    for (const slot1 of slots1) {
      for (const slot2 of slots2) {
        const overlapStart = new Date(Math.max(slot1.start.getTime(), slot2.start.getTime()));
        const overlapEnd = new Date(Math.min(slot1.end.getTime(), slot2.end.getTime()));

        if (differenceInMinutes(overlapEnd, overlapStart) >= duration) {
          result.push({
            start: overlapStart,
            end: overlapEnd,
            score: 0,
            reasons: [],
          });
        }
      }
    }

    return result;
  }

  /**
   * Filter slots by preferred time of day
   */
  private filterByPreferredTimes(slots: TimeSlot[], preferredTimes: string[]): TimeSlot[] {
    return slots.filter(slot => {
      const hour = slot.start.getHours();
      const isMorning = hour >= 9 && hour < 12;
      const isAfternoon = hour >= 14 && hour < 18;

      if (preferredTimes.includes('morning') && isMorning) return true;
      if (preferredTimes.includes('afternoon') && isAfternoon) return true;
      return preferredTimes.length === 0;
    });
  }

  /**
   * Score time slots based on various factors
   */
  private async scoreTimeSlots(slots: TimeSlot[], application: any): Promise<TimeSlot[]> {
    return slots.map(slot => {
      let score = 100;
      const reasons: string[] = [];

      // Prefer morning slots
      const hour = slot.start.getHours();
      if (hour >= 9 && hour < 12) {
        score += 10;
        reasons.push('morning_time');
      }

      // Avoid early morning or late evening
      if (hour < 10 || hour >= 17) {
        score -= 10;
      }

      // Prefer weekdays
      const dayOfWeek = slot.start.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        score += 5;
      }

      // Prefer slots sooner rather than later
      const daysFromNow = differenceInMinutes(slot.start, new Date()) / (60 * 24);
      if (daysFromNow <= 3) {
        score += 10;
        reasons.push('soon_availability');
      } else if (daysFromNow > 7) {
        score -= 5;
      }

      slot.score = score;
      slot.reasons = reasons;

      return slot;
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate available slots for a single day
   */
  private calculateDaySlots(
    date: Date,
    availability: any,
    existingInterviews: any[],
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const dayOfWeek = date.getDay() + 1; // Convert to Monday=1 format

    // Check if it's a working day
    if (!availability.workDays.includes(dayOfWeek)) {
      return slots;
    }

    // Check if it's a blackout date
    if (availability.blackoutDates.some(d => isSameDay(new Date(d), date))) {
      return slots;
    }

    // Parse work hours
    const [workStartHour, workStartMinute] = availability.workStartAt.split(':').map(Number);
    const [workEndHour, workEndMinute] = availability.workEndAt.split(':').map(Number);

    let workStart = setMinutes(setHours(date, workStartHour), workStartMinute);
    let workEnd = setMinutes(setHours(date, workEndHour), workEndMinute);

    // Subtract break time
    if (availability.breakStartAt && availability.breakEndAt) {
      const [breakStartHour, breakStartMinute] = availability.breakStartAt.split(':').map(Number);
      const [breakEndHour, breakEndMinute] = availability.breakEndAt.split(':').map(Number);
      const breakStart = setMinutes(setHours(date, breakStartHour), breakStartMinute);
      const breakEnd = setMinutes(setHours(date, breakEndHour), breakEndMinute);

      // Morning slot: before break
      this.addSlotIfAvailable(slots, workStart, breakStart, existingInterviews);

      // Afternoon slot: after break
      this.addSlotIfAvailable(slots, breakEnd, workEnd, existingInterviews);
    } else {
      // No break, single slot
      this.addSlotIfAvailable(slots, workStart, workEnd, existingInterviews);
    }

    return slots;
  }

  /**
   * Add time slot if not blocked by existing interviews
   */
  private addSlotIfAvailable(
    slots: TimeSlot[],
    start: Date,
    end: Date,
    existingInterviews: any[],
  ) {
    const slotDuration = differenceInMinutes(end, start);

    // Find conflicts with existing interviews
    const hasConflict = existingInterviews.some(interview => {
      const interviewStart = new Date(interview.scheduledAt);
      const interviewEnd = addMinutes(interviewStart, interview.duration);

      return (
        (isBefore(interviewStart, end) && isAfter(interviewEnd, start)) ||
        (isBefore(start, interviewEnd) && isAfter(end, interviewStart))
      );
    });

    if (!hasConflict && slotDuration > 0) {
      slots.push({
        start,
        end,
        score: 0,
        reasons: [],
      });
    }
  }

  /**
   * Get existing interviews for a user in date range
   */
  private async getExistingInterviews(userId: string, startDate: Date, endDate: Date) {
    return this.prisma.interview.findMany({
      where: {
        interviewerId: userId,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: 'CANCELLED',
        },
      },
    });
  }

  /**
   * Create interview invitation
   */
  private async createInterviewInvitation(interviewId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: { application: true },
    });

    if (!interview) return;

    // Set expiration to 48 hours from now
    const expiresAt = addDays(new Date(), 2);

    await this.prisma.interviewInvitation.create({
      data: {
        interviewId,
        expiresAt,
      },
    });

    // TODO: Send email invitation
    // await this.emailService.sendInterviewInvitation(interview);
  }

  /**
   * Schedule automatic reminders for an interview
   */
  private async scheduleReminders(interview: any) {
    const { id, scheduledAt } = interview;

    // 24 hours before
    const before24h = addMinutes(scheduledAt, -24 * 60);
    if (isBefore(before24h, new Date())) {
      await this.prisma.interviewReminder.create({
        data: {
          interviewId: id,
          type: 'BEFORE_24H',
          scheduledAt: before24h,
        },
      });
    }

    // 1 hour before
    const before1h = addMinutes(scheduledAt, -60);
    if (isBefore(before1h, new Date())) {
      await this.prisma.interviewReminder.create({
        data: {
          interviewId: id,
          type: 'BEFORE_1H',
          scheduledAt: before1h,
        },
      });
    }

    // Follow up (if no response after interview)
    const followUp = addMinutes(scheduledAt, interview.duration + 60);
    await this.prisma.interviewReminder.create({
      data: {
        interviewId: id,
        type: 'FOLLOW_UP',
        scheduledAt: followUp,
      },
    });
  }
}
