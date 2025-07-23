
import React from 'react';
import { Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onClear: () => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear
}) => {
  return (
    <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              {startDate ? format(startDate, "MMM dd, yyyy") : "Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={startDate || undefined}
              onSelect={(date) => onStartDateChange(date || null)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        
        <span className="text-gray-500">to</span>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              {endDate ? format(endDate, "MMM dd, yyyy") : "End Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={endDate || undefined}
              onSelect={(date) => onEndDateChange(date || null)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        
        {(startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
