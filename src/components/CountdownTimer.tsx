import React, { useState, useEffect } from 'react';
import { Clock, Timer, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface CountdownTimerProps {
  endDate: Date;
  type: 'sale' | 'launch' | 'restock' | 'limited';
  title?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showDays?: boolean;
  urgencyThreshold?: number; // hours
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function CountdownTimer({ 
  endDate, 
  type, 
  title,
  size = 'medium',
  className = '',
  showDays = true,
  urgencyThreshold = 24
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [isUrgent, setIsUrgent] = useState(false);

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const endTime = new Date(endDate).getTime();
    const difference = endTime - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const totalHours = days * 24 + hours;
      setIsUrgent(totalHours <= urgencyThreshold);

      return { days, hours, minutes, seconds, total: difference };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [endDate, urgencyThreshold]);

  if (timeLeft.total <= 0) {
    return (
      <div className={`flex items-center text-gray-500 ${className}`}>
        <Timer size={16} className="mr-1" />
        <span className="text-sm font-medium">Ended</span>
      </div>
    );
  }

  const getTypeConfig = () => {
    switch (type) {
      case 'sale':
        return {
          icon: AlertTriangle,
          badgeClass: 'bg-red-600 text-white',
          textClass: 'text-red-600',
          label: 'Sale Ends In'
        };
      case 'launch':
        return {
          icon: Timer,
          badgeClass: 'bg-blue-600 text-white',
          textClass: 'text-blue-600',
          label: 'Launches In'
        };
      case 'restock':
        return {
          icon: Clock,
          badgeClass: 'bg-green-600 text-white',
          textClass: 'text-green-600',
          label: 'Restocks In'
        };
      case 'limited':
      default:
        return {
          icon: Clock,
          badgeClass: 'bg-gold text-navy',
          textClass: 'text-gold',
          label: 'Limited Time'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'text-xs',
          badge: 'text-xs px-2 py-1',
          numbers: 'text-sm font-semibold',
          labels: 'text-xs',
          spacing: 'space-x-1'
        };
      case 'large':
        return {
          container: 'text-base',
          badge: 'text-sm px-3 py-2',
          numbers: 'text-2xl font-bold',
          labels: 'text-sm',
          spacing: 'space-x-3'
        };
      case 'medium':
      default:
        return {
          container: 'text-sm',
          badge: 'text-xs px-2 py-1',
          numbers: 'text-lg font-semibold',
          labels: 'text-xs',
          spacing: 'space-x-2'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`${sizeClasses.container} ${className}`}>
      {title && (
        <div className="flex items-center mb-2">
          <Icon size={16} className={`mr-1 ${config.textClass}`} />
          <span className={`font-medium ${config.textClass}`}>{title}</span>
        </div>
      )}
      
      <div className={`flex items-center ${sizeClasses.spacing}`}>
        {showDays && timeLeft.days > 0 && (
          <div className="text-center">
            <div className={`${sizeClasses.numbers} ${isUrgent ? 'text-red-600' : 'text-foreground'}`}>
              {timeLeft.days}
            </div>
            <div className={`${sizeClasses.labels} text-muted-foreground`}>
              {timeLeft.days === 1 ? 'day' : 'days'}
            </div>
          </div>
        )}
        
        <div className="text-center">
          <div className={`${sizeClasses.numbers} ${isUrgent ? 'text-red-600' : 'text-foreground'}`}>
            {timeLeft.hours.toString().padStart(2, '0')}
          </div>
          <div className={`${sizeClasses.labels} text-muted-foreground`}>hrs</div>
        </div>
        
        <div className={`${sizeClasses.numbers} ${isUrgent ? 'text-red-600' : 'text-muted-foreground'}`}>:</div>
        
        <div className="text-center">
          <div className={`${sizeClasses.numbers} ${isUrgent ? 'text-red-600' : 'text-foreground'}`}>
            {timeLeft.minutes.toString().padStart(2, '0')}
          </div>
          <div className={`${sizeClasses.labels} text-muted-foreground`}>min</div>
        </div>
        
        <div className={`${sizeClasses.numbers} ${isUrgent ? 'text-red-600' : 'text-muted-foreground'}`}>:</div>
        
        <div className="text-center">
          <div className={`${sizeClasses.numbers} ${isUrgent ? 'text-red-600' : 'text-foreground'}`}>
            {timeLeft.seconds.toString().padStart(2, '0')}
          </div>
          <div className={`${sizeClasses.labels} text-muted-foreground`}>sec</div>
        </div>
      </div>

      {isUrgent && (
        <Badge className={`mt-2 ${config.badgeClass} animate-pulse`}>
          <AlertTriangle size={12} className="mr-1" />
          Hurry! Limited Time
        </Badge>
      )}
    </div>
  );
}

// Additional utility component for stock urgency
export function StockUrgencyIndicator({ 
  stockCount, 
  isLimitedEdition = false,
  className = ""
}: { 
  stockCount: number; 
  isLimitedEdition?: boolean;
  className?: string;
}) {
  if (stockCount <= 0) {
    return (
      <div className={`flex items-center text-red-600 ${className}`}>
        <AlertTriangle size={14} className="mr-1" />
        <span className="text-sm font-medium">Out of Stock</span>
      </div>
    );
  }

  if (stockCount <= 2) {
    return (
      <div className={`flex items-center text-red-600 ${className}`}>
        <AlertTriangle size={14} className="mr-1 animate-pulse" />
        <span className="text-sm font-medium">
          {isLimitedEdition ? 'Only' : 'Last'} {stockCount} left!
        </span>
      </div>
    );
  }

  if (stockCount <= 5) {
    return (
      <div className={`flex items-center text-amber-600 ${className}`}>
        <AlertTriangle size={14} className="mr-1" />
        <span className="text-sm font-medium">Only {stockCount} left</span>
      </div>
    );
  }

  if (stockCount <= 10 && isLimitedEdition) {
    return (
      <div className={`flex items-center text-amber-600 ${className}`}>
        <Clock size={14} className="mr-1" />
        <span className="text-sm font-medium">Limited stock ({stockCount} left)</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center text-green-600 ${className}`}>
      <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
      <span className="text-sm">In Stock</span>
    </div>
  );
}