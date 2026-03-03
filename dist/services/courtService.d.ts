export interface CourtSlot {
    start_time: string;
    end_time: string;
    activity: {
        id: string;
        name: string | null;
    } | null;
    /** True when this slot is outside the academy's opening_time–closing_time */
    outside_working_hours?: boolean;
    /** Days of week (0=Sun..6=Sat) when this slot has no activity */
    available_days: number[];
    /** Days of week when this slot is occupied by an activity */
    occupied_days: number[];
}
export interface CourtSlotsResult {
    court: {
        id: string;
        name: string;
    };
    date: string;
    slots: CourtSlot[];
}
export interface AvailableSlot {
    start_time: string;
    end_time: string;
    available_days: number[];
}
export interface CourtWithAvailableSlots {
    id: string;
    name: string;
    available_slots: AvailableSlot[];
}
export interface GetAvailableSlotsResult {
    courts: CourtWithAvailableSlots[];
}
export declare function getAvailableSlotsForCourts(academyId: string, courtIds?: string[]): Promise<GetAvailableSlotsResult>;
export declare function getCourtSlots(courtId: string, academyId: string, date?: Date): Promise<CourtSlotsResult | null>;
export interface CreateCourtInput {
    academyId: string;
    name: string;
    isActive?: boolean;
}
export interface UpdateCourtInput {
    name?: string;
    isActive?: boolean;
}
export interface ListCourtsOptions {
    academyId: string;
    limit?: number;
    offset?: number;
}
export declare function createCourt(input: CreateCourtInput): Promise<{
    academyId: string;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}>;
export declare function listCourts(options: ListCourtsOptions): Promise<{
    courts: {
        academyId: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }[];
    total: number;
}>;
export declare function getCourtById(id: string, academyId: string): Promise<{
    academyId: string;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
} | null>;
export declare function updateCourt(id: string, academyId: string, input: UpdateCourtInput): Promise<{
    academyId: string;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
} | null>;
//# sourceMappingURL=courtService.d.ts.map