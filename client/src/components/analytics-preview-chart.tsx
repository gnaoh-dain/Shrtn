'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type DayPoint = { date: string; count: number };

function fetchMockClicksByDay(): Promise<DayPoint[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { date: '2025-03-22', count: 12 },
        { date: '2025-03-23', count: 19 },
        { date: '2025-03-24', count: 15 },
        { date: '2025-03-25', count: 27 },
        { date: '2025-03-26', count: 22 },
        { date: '2025-03-27', count: 31 },
        { date: '2025-03-28', count: 18 },
      ]);
    }, 450);
  });
}

/**
 * TanStack Query + Recharts — sau này thay queryFn bằng GET /analytics/.../stats
 * và map `clicks_by_day` từ API.
 */
export function AnalyticsPreviewChart() {
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ['analytics-preview', 'clicks_by_day'],
    queryFn: fetchMockClicksByDay,
  });

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Không tải được dữ liệu mẫu.{' '}
        <button type="button" className="underline" onClick={() => void refetch()}>
          Thử lại
        </button>
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {isPending || isFetching ? 'Đang tải…' : 'Dữ liệu mẫu (mock) — thay bằng API analytics'}
        </p>
        <button
          type="button"
          className="text-sm text-primary underline-offset-4 hover:underline"
          onClick={() => void refetch()}
        >
          Refetch
        </button>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--popover))',
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Clicks"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
