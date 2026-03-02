export interface DashboardSummary {
    total_expected_revenue: number;
    total_collected: number;
    total_outstanding: number;
    collection_percentage: number;
    overdue_count: number;
    due_count: number;
}
export declare function getDashboardSummary(academyId: string): Promise<DashboardSummary>;
//# sourceMappingURL=dashboardService.d.ts.map