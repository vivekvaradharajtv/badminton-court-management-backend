export interface AddMemberInput {
    academyId: string;
    activityId: string;
    name: string;
    phone?: string;
    isCaptain?: boolean;
}
export interface UpdateMemberInput {
    name?: string;
    phone?: string;
    isCaptain?: boolean;
}
export declare function addMember(input: AddMemberInput): Promise<{
    academyId: string;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    activityId: string;
    phone: string | null;
    isCaptain: boolean;
}>;
export declare function listMembers(activityId: string, academyId: string): Promise<{
    academyId: string;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    activityId: string;
    phone: string | null;
    isCaptain: boolean;
}[] | null>;
export declare function getMemberById(memberId: string, academyId: string): Promise<{
    academyId: string;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    activityId: string;
    phone: string | null;
    isCaptain: boolean;
} | null>;
export declare function updateMember(memberId: string, academyId: string, input: UpdateMemberInput): Promise<{
    academyId: string;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    activityId: string;
    phone: string | null;
    isCaptain: boolean;
} | null>;
export declare function deleteMember(memberId: string, academyId: string): Promise<{
    deleted: boolean;
} | null>;
//# sourceMappingURL=activityMemberService.d.ts.map