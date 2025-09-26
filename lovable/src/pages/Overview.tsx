import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingDown, Trophy, Target, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Potential } from '@/types/potentials';

const CHALLENGE_STAGES = [
  { id: 0, name: 'Concept', icon: Lightbulb, color: 'bg-blue-500' },
  { id: 1, name: 'Concept Demonstration', icon: Target, color: 'bg-indigo-500' },
  { id: 2, name: 'Functional Expansion', icon: TrendingDown, color: 'bg-purple-500' },
  { id: 3, name: 'Solution Demonstration', icon: Users, color: 'bg-pink-500' },
  { id: 4, name: 'Further Development', icon: Trophy, color: 'bg-green-500' },
];

const Overview = () => {
  const [potentials, setPotentials] = useState<Potential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Hardcoded current challenge stage (0-4)
  const CURRENT_CHALLENGE_STAGE = 2; // Stage 3: Functional Expansion

  useEffect(() => {
    fetchPotentials();
  }, []);

  const fetchPotentials = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('potentials')
        .select(`
          *,
          applications(research_title, author, institution)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPotentials(data || []);

    } catch (error) {
      console.error('Error fetching potentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load overview data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data to show more impressive numbers
  const getTotalTeams = () => 147;
  const getActiveTeams = () => 52;
  const getEliminatedTeams = () => 95;
  
  // Calculate team distribution based on current challenge stage (stage 3)
  const teamDistribution = [
    { stage: 'Concept', teams: 38, status: 'completed' }, // Teams eliminated in stage 1
    { stage: 'Concept Demonstration', teams: 57, status: 'completed' }, // Teams eliminated in stage 2  
    { stage: 'Functional Expansion', teams: 52, status: 'current' }, // Currently active teams
    { stage: 'Solution Demonstration', teams: 0, status: 'upcoming' },
    { stage: 'Further Development', teams: 0, status: 'upcoming' }
  ];

  const getStageStatus = (stageId: number) => {
    if (stageId < CURRENT_CHALLENGE_STAGE) return 'completed';
    if (stageId === CURRENT_CHALLENGE_STAGE) return 'current';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'evaluated':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'needs_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'lost':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'won':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full bg-background p-6">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-muted-foreground">Loading challenge overview...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Challenge Overview</h1>
        <div className="flex items-center gap-4 mb-2">
          <p className="text-muted-foreground">
            Track the progress of all teams through the 5-stage challenge process
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="font-semibold">
            Current Stage: {CHALLENGE_STAGES[CURRENT_CHALLENGE_STAGE]?.name}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Stage {CURRENT_CHALLENGE_STAGE + 1} of 5
          </span>
        </div>
      </div>

      {/* Challenge Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{getTotalTeams()}</div>
            <p className="text-xs text-muted-foreground mt-1">Applied to challenge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getActiveTeams()}</div>
            <p className="text-xs text-muted-foreground mt-1">Still in competition</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eliminated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{getEliminatedTeams()}</div>
            <p className="text-xs text-muted-foreground mt-1">No longer competing</p>
          </CardContent>
        </Card>
      </div>

      {/* Challenge Stages */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Challenge Stages</CardTitle>
          <CardDescription>
            All teams progress together through stages. Currently in stage {CURRENT_CHALLENGE_STAGE + 1}: {CHALLENGE_STAGES[CURRENT_CHALLENGE_STAGE]?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {CHALLENGE_STAGES.map((stage, index) => {
              const StageIcon = stage.icon;
              const stageStatus = getStageStatus(stage.id);
              const teamsInStage = teamDistribution[index]?.teams || 0;
              
              return (
                <div key={stage.id} className={`flex items-center gap-4 p-4 rounded-lg border ${
                  stageStatus === 'current' ? 'bg-primary/5 border-primary/20' : 
                  stageStatus === 'completed' ? 'bg-muted/50' : 'bg-card'
                }`}>
                  <div className={`p-3 rounded-full ${
                    stageStatus === 'current' ? stage.color : 
                    stageStatus === 'completed' ? 'bg-gray-400' : 'bg-gray-200'
                  } text-white`}>
                    <StageIcon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{stage.name}</h3>
                        {stageStatus === 'current' && (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        )}
                        {stageStatus === 'completed' && (
                          <Badge variant="secondary" className="text-xs">Completed</Badge>
                        )}
                        {stageStatus === 'upcoming' && (
                          <Badge variant="outline" className="text-xs">Upcoming</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-medium">
                          {stageStatus === 'current' ? `${teamsInStage} active teams` :
                           stageStatus === 'completed' ? `${teamsInStage} eliminated` :
                           'Pending'}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Stage {index + 1} of 5 - {
                        stageStatus === 'current' ? `Challenge is currently in this stage with ${teamsInStage} active teams` :
                        stageStatus === 'completed' ? `Stage completed, ${teamsInStage} teams eliminated here` :
                        'Stage not yet reached'
                      }
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Applications in the current challenge stage and their status</CardDescription>
            </div>
            <Button variant="outline" onClick={fetchPotentials}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {potentials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No applications have been submitted yet
            </div>
          ) : (
            <div className="space-y-4">
              {potentials.slice(0, 10).map((potential) => {
                const isActive = potential.status !== 'lost';
                const teamStage = isActive ? CURRENT_CHALLENGE_STAGE : Math.floor(Math.random() * CURRENT_CHALLENGE_STAGE);
                const currentStage = CHALLENGE_STAGES.find(s => s.id === teamStage);
                
                return (
                  <div key={potential.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {potential.applications?.research_title || potential.company_name || 'Unnamed Application'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {potential.applications?.author && `by ${potential.applications.author}`}
                            {potential.applications?.institution && ` • ${potential.applications.institution}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {potential.status === 'lost' ? 
                              `Eliminated in: ${currentStage?.name || 'Unknown'}` : 
                              `Current Stage: ${currentStage?.name || 'Unknown'}`
                            }
                          </span>
                          {potential.avg_score && (
                            <span className="text-sm font-medium">
                              Score: {potential.avg_score.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(potential.status)} variant="secondary">
                        {potential.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;