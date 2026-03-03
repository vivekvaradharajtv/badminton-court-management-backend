export interface WorkHoursSettings {
    opening_time?: string | null;
    closing_time?: string | null;
    slot_duration?: number | null;
}
export interface ConflictingActivity {
    id: string;
    name: string | null;
    start_time: string;
    end_time: string;
    court_name: string;
}
export type UpdateSettingsResult = {
    updated: true;
    settings: {
        opening_time: string | null;
        closing_time: string | null;
        slot_duration: number | null;
    };
} | {
    updated: false;
    requiresConfirmation: true;
    conflictingActivities: ConflictingActivity[];
    message: string;
} | null;
export declare function getAcademySettings(academyId: string): Promise<{
    opening_time: string | null;
    closing_time: string | null;
    slot_duration: number | null;
} | null>;
export declare function updateAcademySettings(academyId: string, input: WorkHoursSettings, options?: {
    confirmed?: boolean;
}): Promise<UpdateSettingsResult>;
//# sourceMappingURL=academyService.d.ts.map