import React from 'react';
import { Tabs, Tab } from '@mui/material';
import type { TodoFilter } from '../types/Todo';

interface TaskFiltersProps {
  value: TodoFilter;
  onChange: (value: TodoFilter) => void;
  tabsRef?: React.Ref<HTMLDivElement>;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ value, onChange, tabsRef }) => (
  <Tabs
    value={value}
    onChange={(_, next) => onChange(next)}
    ref={tabsRef}
    aria-label="Task filters"
    variant="fullWidth"
  >
    <Tab label="All" value="all" />
    <Tab label="Active" value="active" />
    <Tab label="Completed" value="completed" />
  </Tabs>
);

export default TaskFilters;
