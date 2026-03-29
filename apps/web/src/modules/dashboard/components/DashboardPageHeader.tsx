'use client';

import { ChartPieSlice } from '@phosphor-icons/react';
import { PageHeader } from '@/shared/components/layout/PageHeader';

type DashboardPageHeaderProps = {
  title: string;
  description: string;
};

export function DashboardPageHeader({ title, description }: DashboardPageHeaderProps) {
  return <PageHeader title={title} description={description} icon={ChartPieSlice} />;
}
