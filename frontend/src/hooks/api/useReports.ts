import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  reportsService, 
  ReportTemplate, 
  GeneratedReport
} from '@/services/api/reports.service';
import { toast } from 'sonner';

const REPORT_TEMPLATES_QUERY_KEY = 'report-templates';
const REPORT_HISTORY_QUERY_KEY = 'report-history';
const SCHEDULED_REPORTS_QUERY_KEY = 'scheduled-reports';

export const useReportTemplates = (params?: {
  category?: string;
  search?: string;
  isSystem?: boolean;
}) => {
  return useQuery<ReportTemplate[]>({
    queryKey: [REPORT_TEMPLATES_QUERY_KEY, params],
    queryFn: () => reportsService.getTemplates(params),
  });
};

export const useReportTemplate = (id: string) => {
  return useQuery<ReportTemplate>({
    queryKey: [REPORT_TEMPLATES_QUERY_KEY, id],
    queryFn: () => reportsService.getTemplateById(id),
    enabled: !!id,
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      templateId, 
      data 
    }: { 
      templateId: string; 
      data: {
        parameters: Record<string, any>;
        format?: 'pdf' | 'excel' | 'csv' | 'json';
        emailNotification?: boolean;
      } 
    }) => reportsService.generateReport(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORT_HISTORY_QUERY_KEY] });
      toast.success('Report generation started. You will be notified when it\'s ready.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate report: ${error.message}`);
    },
  });
};

export const useReportStatus = (reportId: string) => {
  return useQuery<GeneratedReport>({
    queryKey: [REPORT_HISTORY_QUERY_KEY, reportId],
    queryFn: () => reportsService.getReportStatus(reportId),
    enabled: !!reportId,
    refetchInterval: (data) => {
      // Only poll if the report is still processing
      return data?.status === 'processing' ? 5000 : false;
    },
  });
};

export const useReportHistory = (params?: {
  templateId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery<{
    data: GeneratedReport[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    queryKey: [REPORT_HISTORY_QUERY_KEY, params],
    queryFn: () => reportsService.getReportHistory(params),
    keepPreviousData: true,
  });
};

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: (reportId: string) => reportsService.downloadReport(reportId),
    onError: (error: Error) => {
      toast.error(`Failed to download report: ${error.message}`);
    },
  });
};

export const useReportStats = () => {
  return useQuery({
    queryKey: ['report-stats'],
    queryFn: () => reportsService.getReportStats(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useScheduleReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      templateId, 
      data 
    }: { 
      templateId: string; 
      data: {
        parameters: Record<string, any>;
        format: 'pdf' | 'excel' | 'csv' | 'json';
        schedule: {
          frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
          dayOfWeek?: number;
          dayOfMonth?: number;
          time: string;
          timezone: string;
        };
        recipients: string[];
        active: boolean;
      } 
    }) => reportsService.scheduleReport(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCHEDULED_REPORTS_QUERY_KEY] });
      toast.success('Report scheduled successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to schedule report: ${error.message}`);
    },
  });
};

export const useScheduledReports = () => {
  return useQuery({
    queryKey: [SCHEDULED_REPORTS_QUERY_KEY],
    queryFn: () => reportsService.getScheduledReports(),
  });
};

export const useUpdateScheduledReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      scheduleId, 
      data 
    }: { 
      scheduleId: string; 
      data: any 
    }) => reportsService.updateScheduledReport(scheduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCHEDULED_REPORTS_QUERY_KEY] });
      toast.success('Scheduled report updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update scheduled report: ${error.message}`);
    },
  });
};

export const useDeleteScheduledReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (scheduleId: string) => reportsService.deleteScheduledReport(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCHEDULED_REPORTS_QUERY_KEY] });
      toast.success('Scheduled report deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete scheduled report: ${error.message}`);
    },
  });
};
