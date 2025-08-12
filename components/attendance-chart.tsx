"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import type { DailyAttendanceSummary } from "@/lib/attendance"

interface AttendanceChartProps {
  data: DailyAttendanceSummary[]
  type: "bar" | "line" | "pie"
  title: string
  description?: string
}

const chartConfig = {
  present: {
    label: "Present",
    color: "hsl(var(--chart-1))",
  },
  late: {
    label: "Late",
    color: "hsl(var(--chart-2))",
  },
  absent: {
    label: "Absent",
    color: "hsl(var(--chart-3))",
  },
  attendanceRate: {
    label: "Attendance Rate",
    color: "hsl(var(--chart-4))",
  },
}

export function AttendanceChart({ data, type, title, description }: AttendanceChartProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const pieData =
    data.length > 0
      ? [
          {
            name: "Present",
            value: data.reduce((sum, d) => sum + d.presentCount, 0),
            color: chartConfig.present.color,
          },
          { name: "Late", value: data.reduce((sum, d) => sum + d.lateCount, 0), color: chartConfig.late.color },
          { name: "Absent", value: data.reduce((sum, d) => sum + d.absentCount, 0), color: chartConfig.absent.color },
        ]
      : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          {type === "bar" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="presentCount" fill={chartConfig.present.color} name="Present" />
                <Bar dataKey="lateCount" fill={chartConfig.late.color} name="Late" />
                <Bar dataKey="absentCount" fill={chartConfig.absent.color} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {type === "line" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="attendanceRate"
                  stroke={chartConfig.attendanceRate.color}
                  strokeWidth={2}
                  name="Attendance Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {type === "pie" && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
