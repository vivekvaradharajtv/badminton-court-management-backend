export interface CreateActivityInput {
    academyId: string;
    courtId: string;
    name?: string;
    startTime: string;
    endTime: string;
    startDate: Date;
    monthlyFee: number;
    maxPlayers: number;
    isActive?: boolean;
}
export interface UpdateActivityInput {
    name?: string;
    startTime?: string;
    endTime?: string;
    monthlyFee?: number;
    maxPlayers?: number;
    isActive?: boolean;
    courtId?: string;
}
export interface ListActivitiesOptions {
    academyId: string;
    courtId?: string;
    limit?: number;
    offset?: number;
}
/** Check if activity time range overlaps any existing activity on the same court */
export declare function hasOverlap(courtId: string, startTime: string, endTime: string, excludeActivityId?: string): Promise<boolean>;
export declare function createActivity(input: CreateActivityInput): Promise<{
    academyId: string;
    id: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    courtId: string;
    startTime: string;
    endTime: string;
    startDate: Date;
    monthlyFee: import("@prisma/client/runtime/library").Decimal;
    maxPlayers: number;
}>;
export declare function listActivities(options: ListActivitiesOptions): Promise<{
    activities: ({
        court: {
            id: string;
            name: string;
        };
    } & {
        academyId: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        courtId: string;
        startTime: string;
        endTime: string;
        startDate: Date;
        monthlyFee: import("@prisma/client/runtime/library").Decimal;
        maxPlayers: number;
    })[];
    total: number;
}>;
export declare function getActivityById(id: string, academyId: string): Promise<({
    court: {
        id: string;
        name: string;
    };
} & {
    academyId: string;
    id: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    courtId: string;
    startTime: string;
    endTime: string;
    startDate: Date;
    monthlyFee: import("@prisma/client/runtime/library").Decimal;
    maxPlayers: number;
}) | null>;
export declare function updateActivity(id: string, academyId: string, input: UpdateActivityInput): Promise<({
    court: {
        id: string;
        name: string;
    };
} & {
    academyId: string;
    id: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    courtId: string;
    startTime: string;
    endTime: string;
    startDate: Date;
    monthlyFee: import("@prisma/client/runtime/library").Decimal;
    maxPlayers: number;
}) | null>;
export declare function deactivateActivity(id: string, academyId: string): Promise<({
    court: {
        id: string;
        name: string;
    };
} & {
    academyId: string;
    id: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    courtId: string;
    startTime: string;
    endTime: string;
    startDate: Date;
    monthlyFee: import("@prisma/client/runtime/library").Decimal;
    maxPlayers: number;
}) | null>;
//# sourceMappingURL=activityService.d.ts.map