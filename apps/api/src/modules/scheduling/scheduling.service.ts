import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  addMinutes,
  addDays,
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
   * Get user availability configuration (simplified version)
   */
  async getUserAvailability(userId: string) {
    // TODO: Implement with UserAvailability model when Prisma client is updated
    // For now, return a default configuration
    return {
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
    };
  }

  /**
   * Update user availability configuration (simplified version)
   */
  async updateUserAvailability(userId: string, data: any) {
    // TODO: Implement with UserAvailability model when Prisma client is updated
    // For now, just return the data
    return { userId, ...data };
  }

  /**
   * Get available slots for a specific date range
   */
  async getAvailableSlots(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AvailabilityResult[]> {
    const results: AvailabilityResult[] = [];
    const current = startOfDay(startDate);
    const end = endOfDay(endDate);

    while (current <= end) {
      // Generate working hour slots for each day
      const slots: TimeSlot[] = [
        {
          start: setHours(setMinutes(current, 0), 9),
          end: setHours(setMinutes(current, 0), 12),
          score: 1.0,
          reasons: ['Morning slot'],
        },
        {
          start: setHours(setMinutes(current, 0), 14),
          end: setHours(setMinutes(current, 0), 18),
          score: 0.9,
          reasons: ['Afternoon slot'],
        },
      ];

      results.push({
        date: current,
        availableSlots: slots,
      });

      // Move to next day
      current.setDate(current.getDate() + 1);
    }

    return results;
  }

  /**
   * Get interviewers' availability
   */
  private async getInterviewersAvailability(
    interviewerIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Map<string, TimeSlot[]>> {
    const availabilityMap = new Map<string, TimeSlot[]>();

    for (const interviewerId of interviewerIds) {
      const availability = await this.getAvailableSlots(
        interviewerId,
        startDate,
        endDate,
      );

      // Flatten all slots
      const allSlots: TimeSlot[] = [];
      availability.forEach(result => {
        allSlots.push(...result.availableSlots);
      });

      availabilityMap.set(interviewerId, allSlots);
    }

    return availabilityMap;
  }

  /**
   * Find overlapping time slots for all interviewers
   */
  private findOverlappingSlots(
    interviewerAvailabilities: Map<string, TimeSlot[]>,
    duration: number,
    preferredTimes?: string[],
  ): TimeSlot[] {
    const interviewerIds = Array.from(interviewerAvailabilities.keys());

    if (interviewerIds.length === 0) {
      return [];
    }

    // Get slots for the first interviewer
    let candidateSlots = interviewerAvailabilities.get(interviewerIds[0]) || [];

    // Find overlapping slots with other interviewers
    for (let i = 1; i < interviewerIds.length; i++) {
      const otherSlots = interviewerAvailabilities.get(interviewerIds[i]) || [];
      candidateSlots = this.findIntersection(candidateSlots, otherSlots, duration);
    }

    // Filter by preferred times
    if (preferredTimes && preferredTimes.length > 0) {
      candidateSlots = candidateSlots.filter(slot => {
        const hour = slot.start.getHours();
        if (preferredTimes.includes('morning') && hour >= 9 && hour < 12) {
          return true;
        }
        if (preferredTimes.includes('afternoon') && hour >= 14 && hour < 18) {
          return true;
        }
        return false;
      });
    }

    return candidateSlots;
  }

  /**
   * Find intersection of two slot lists
   */
  private findIntersection(slots1: TimeSlot[], slots2: TimeSlot[], duration: number): TimeSlot[] {
    const intersections: TimeSlot[] = [];

    for (const slot1 of slots1) {
      for (const slot2 of slots2) {
        const overlapStart = new Date(Math.max(slot1.start.getTime(), slot2.start.getTime()));
        const overlapEnd = new Date(Math.min(slot1.end.getTime(), slot2.end.getTime()));

        const overlapDuration = differenceInMinutes(overlapEnd, overlapStart);

        if (overlapDuration >= duration) {
          intersections.push({
            start: overlapStart,
            end: overlapEnd,
            score: Math.min(slot1.score, slot2.score),
            reasons: [...slot1.reasons, ...slot2.reasons],
          });
        }
      }
    }

    return intersections;
  }

  /**
   * Score time slots based on various factors
   */
  private async scoreTimeSlots(slots: TimeSlot[], application: any): Promise<TimeSlot[]> {
    return slots.map(slot => {
      let score = slot.score;
      const reasons = [...slot.reasons];

      // Prefer earlier slots
      const daysUntilSlot = Math.ceil((slot.start.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilSlot <= 3) {
        score *= 1.2;
        reasons.push('Available soon');
      } else if (daysUntilSlot <= 7) {
        score *= 1.1;
      }

      // Prefer morning slots
      const hour = slot.start.getHours();
      if (hour >= 9 && hour < 12) {
        score *= 1.1;
        reasons.push('Morning time slot');
      }

      // Avoid Monday mornings
      const dayOfWeek = slot.start.getDay();
      if (dayOfWeek === 1 && hour < 12) {
        score *= 0.9;
      }

      return {
        ...slot,
        score,
        reasons,
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Confirm and create an interview with selected time slot
   */
  async confirmInterview(data: {
    applicationId: string;
    interviewerIds: string[];
    scheduledAt: Date;
    duration: number;
    location?: string;
    title?: string;
    description?: string;
  }) {
    const { applicationId, interviewerIds, scheduledAt, duration, location, title, description } = data;

    // Validate application
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Create interviews for each interviewer
    const interviews = await Promise.all(
      interviewerIds.map(interviewerId =>
        this.prisma.interview.create({
          data: {
            applicationId,
            interviewerId,
            title: title || '面试',
            description,
            status: 'SCHEDULED',
            type: 'VIDEO',
            stage: 'FIRST_ROUND',
            scheduledAt,
            duration,
            location,
          },
        }),
      ),
    );

    return {
      success: true,
      message: `Successfully created ${interviews.length} interview(s)`,
      data: interviews,
    };
  }

  /**
   * Get interview invitation status
   */
  async getInterviewInvitation(interviewId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // TODO: Implement with InterviewInvitation model when Prisma client is updated
    return {
      interviewId,
      status: 'PENDING',
      sentAt: interview.createdAt,
    };
  }

  /**
   * Reschedule an interview
   */
  async rescheduleInterview(interviewId: string, newScheduledAt: Date) {
    const interview = await this.prisma.interview.update({
      where: { id: interviewId },
      data: {
        scheduledAt: newScheduledAt,
      },
    });

    return {
      success: true,
      message: 'Interview rescheduled successfully',
      data: interview,
    };
  }

  /**
   * Sync external calendar (placeholder)
   */
  async syncExternalCalendar(userId: string, provider: string) {
    // TODO: Implement calendar sync when CalendarIntegration model is ready
    return {
      success: true,
      message: 'Calendar sync not yet implemented',
      data: { userId, provider },
    };
  }
}
