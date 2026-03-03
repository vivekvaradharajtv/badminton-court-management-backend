export interface CourtSlot {
    start_time: string;
    end_time: string;
    activity: {
        id: string;
        name: string | null;
    } | null;
}
export interface CourtSlotsResult {
    court: {
        id: string;
        name: string;
    };
    date: string;
    slots: CourtSlot[];
}
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