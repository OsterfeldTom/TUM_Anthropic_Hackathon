import { Check, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProcessingStepsProps {
  currentProcessingStep?: number;
  currentActionStep?: number;
  onProcessingStepClick?: (step: number) => void;
  onActionStepClick?: (step: number) => void;
  clickable?: boolean;
  isLost?: boolean;
  status?: string;
}

const PROCESSING_STEPS = [
  'Concept',
  'Concept Demonstration',
  'Functional Expansion',
  'Solution Demonstration',
  'Further Development (optional follow-on)'
];

const ACTION_STEPS = [
  'Document Uploaded',
  'Deep AI Analysis',
  'Data Enrichment Call'
];

const ProcessingSteps = ({ 
  currentProcessingStep = 0, 
  currentActionStep = 0, 
  onProcessingStepClick, 
  onActionStepClick, 
  clickable = false, 
  isLost = false, 
  status 
}: ProcessingStepsProps) => {
  const getStepStatus = (stepIndex: number, currentStep: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const getStepColor = (stepStatus: string, isActionProgress = false) => {
    if (isLost) {
      return 'text-red-500 border-red-500 bg-red-50 dark:bg-red-950';
    }
    
    if (status === 'invested') {
      return 'text-green-600 border-green-600 bg-green-50 dark:bg-green-950';
    }
    
    if (isActionProgress) {
      switch (stepStatus) {
        case 'completed':
          return 'text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-950';
        case 'current': 
          return 'text-blue-600 border-blue-600 bg-blue-100 dark:bg-blue-900';
        default:
          return 'text-blue-400 border-blue-300 bg-blue-25 dark:bg-blue-950/50';
      }
    }
    
    switch (stepStatus) {
      case 'completed':
        return 'text-primary border-primary bg-primary/10';
      case 'current': 
        return 'text-primary border-primary bg-primary/20';
      default:
        return 'text-muted-foreground border-muted';
    }
  };

  const renderStepTrack = (
    steps: string[], 
    currentStep: number, 
    onStepClick: ((step: number) => void) | undefined,
    title: string,
    isActionProgress = false
  ) => (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(index, currentStep);
        const isCompleted = stepStatus === 'completed';
        const isCurrent = stepStatus === 'current';
        
        return (
          <div key={step} className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
              isActionProgress && onStepClick ? 'cursor-pointer hover:scale-110' : ''
            } ${getStepColor(stepStatus, isActionProgress)}`}
            onClick={isActionProgress && onStepClick ? (e) => { e.preventDefault(); e.stopPropagation(); onStepClick(index); } : undefined}>
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <Circle className={`w-3 h-3 ${isCurrent ? 'fill-current' : ''}`} />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${isActionProgress && onStepClick ? 'cursor-pointer' : ''} ${
                isCurrent ? 'text-foreground' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
              } ${isLost ? 'text-red-600 dark:text-red-400' : status === 'invested' ? 'text-green-600 dark:text-green-400' : isActionProgress && isCurrent ? 'text-blue-600' : isActionProgress && isCompleted ? 'text-blue-600' : ''}`}
              onClick={isActionProgress && onStepClick ? (e) => { e.preventDefault(); onStepClick(index); } : undefined}>
                {step}
              </p>
            </div>
            {isCompleted && (
              <div className="text-xs text-muted-foreground">
                ✓ Completed
              </div>
            )}
            {isCurrent && (
              <div className={`text-xs font-medium ${isActionProgress ? 'text-blue-600' : 'text-primary'}`}>
                In Progress
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {renderStepTrack(ACTION_STEPS, currentActionStep, onActionStepClick, "Action Progress", true)}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingSteps;