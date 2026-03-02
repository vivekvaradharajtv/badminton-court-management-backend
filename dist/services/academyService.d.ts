export interface WorkHoursSettings {
    opening_time?: string | null;
    closing_time?: string | null;
    slot_duration?: number | null;
}
export declare function getAcademySettings(academyId: string): Promise<{
    opening_time: string | null;
    closing_time: string | null;
    slot_duration: number | null;
} | null>;
export declare function updateAcademySettings(academyId: string, input: WorkHoursSettings): Promise<{
    opening_time: string | null;
    closing_time: string | null;
    slot_duration: number | null;
} | null>;
//# sourceMappingURL=academyService.d.ts.map