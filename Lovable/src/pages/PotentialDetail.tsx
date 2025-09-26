import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import ProcessingSteps from '@/components/ProcessingSteps';
import SpiderChart from '@/components/SpiderChart';
import { Potential, CriteriaScore } from '@/types/potentials';
import { ArrowLeft, Download, ExternalLink, Save, Phone, FileText } from 'lucide-react';

const PotentialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [potential, setPotential] = useState<Potential | null>(null);
  const [criteriaScores, setCriteriaScores] = useState<CriteriaScore[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const statusColors = {
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    evaluated: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    needs_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    declined: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    lost: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    won: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
  };

  const fetchPotential = async (showLoading: boolean = true) => {
    if (!id) return;
    try {
      if (showLoading) setIsLoading(true);
      const { data, error } = await supabase
        .from('potentials')
        .select(`*, applications(*)`)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        toast({ title: 'Error', description: 'Potential not found.', variant: 'destructive' });
        navigate('/potentials');
        return;
      }
      setPotential(data);
      setNotes(data.notes || '');
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load potential details.', variant: 'destructive' });
    }
  };

  const fetchCriteriaScores = async () => {
    if (!id) return;
    try {
      let joinedData: any[] | null = null;
      const { data, error } = await supabase
        .from('criteria_scores')
        .select('*,criteria_preferences(criterion)')
        .eq('potential_id', id)
        .order('criterion_id');
      if (!error) joinedData = (data as any[]) || null;

      if (!joinedData) {
        const { data: fallback } = await supabase
          .from('criteria_scores')
          .select('*')
          .eq('potential_id', id)
          .order('criterion_id');
        joinedData = (fallback as any[]) || [];
      }

      const transformed = joinedData.map((s: any) => ({
        ...s,
        criterion: s?.criteria_preferences?.criterion ?? s?.criterion ?? s?.criterion_id ?? 'Unknown Criterion'
      }));
      setCriteriaScores(transformed);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPotential();
      fetchCriteriaScores();
    }
  }, [id]);

  useEffect(() => {
    if (potential) setIsLoading(false);
  }, [potential]);

  const handleStartCall = async () => {
    if (!potential?.id) return;
    toast({ title: 'Starting Call', description: 'Initiating discovery call for this potential...' });
    setTimeout(() => {
      toast({ title: 'Call Started', description: 'Discovery call has been initiated successfully.' });
    }, 2000);
  };

  const handleLinkToApplication = () => {
    if (potential?.application_id) navigate(`/applications/${potential.application_id}`);
    else toast({ title: 'No Application', description: 'This potential is not linked to an application.', variant: 'destructive' });
  };

  const handleSaveNotes = async () => {
    if (!potential?.id) return;
    try {
      setIsSavingNotes(true);
      const { error } = await supabase.from('potentials').update({ notes }).eq('id', potential.id);
      if (error) throw error;
      setPotential(prev => prev ? { ...prev, notes } : null);
      toast({ title: 'Success', description: 'Notes saved successfully.' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to save notes.', variant: 'destructive' });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const onActionStepClick = async (step: number) => {
    if (!potential?.id) return;
    try {
      const { error } = await supabase
        .from('potentials')
        .update({ progress_stage: step })
        .eq('id', potential.id);
      if (error) throw error;
      await fetchPotential(false);
      toast({ title: 'Success', description: 'Action stage updated successfully.' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to update action stage.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-[100vw] overflow-x-hidden">{/* ✅ fix */}
        <div className="flex justify-center items-center min-h-64">
          <div className="text-muted-foreground">Loading potential details...</div>
        </div>
      </div>
    );
  }

  if (!potential) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-[100vw] overflow-x-hidden">{/* ✅ fix */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Potential Not Found</h1>
          <Button onClick={() => navigate('/potentials')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Potentials
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-[100vw] overflow-x-hidden">{/* ✅ fix */}
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/potentials')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Potentials
          </Button>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0">{/* ✅ fix */}
            <h1 className="text-3xl font-bold truncate">{/* ✅ fix */}
              {potential.applications?.research_title || potential.company_name || 'Potential Details'}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={statusColors[potential.status as keyof typeof statusColors] || 'bg-muted text-muted-foreground'} variant="secondary">
                {potential.status}
              </Badge>
              {potential.avg_score && (
                <Badge variant="outline" className="font-mono">
                  Score: {potential.avg_score.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {potential.pdf_url && (
              <>
                <Button variant="outline" onClick={() => window.open(potential.pdf_url!, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = potential.pdf_url!;
                    link.download = `${potential.company_name || 'potential'}-deck.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
            <Button variant="outline" onClick={handleLinkToApplication}>
              <FileText className="h-4 w-4 mr-2" />
              View Application
            </Button>
            {potential.progress_stage === 2 && (
              <Button onClick={handleStartCall} className="bg-primary hover:bg-primary/90">
                <Phone className="h-4 w-4 mr-2" />
                Start Call
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex flex-col space-y-8">
        {/* Application Information */}
        <Card className="w-full max-w-full overflow-hidden">{/* ✅ fix */}
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {potential.applications && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Research Title</label>
                    <p className="mt-2 text-base leading-relaxed break-words">{/* ✅ fix */}
                      {potential.applications.research_title || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Author</label>
                    <p className="mt-2 text-base break-words">{/* ✅ fix */}
                      {potential.applications.author || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Institution</label>
                    <p className="mt-2 text-base break-words">{potential.applications.institution || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Research Area</label>
                    <p className="mt-2 text-base break-words">{potential.applications.research_area || 'N/A'}</p>
                  </div>
                </div>
                {potential.applications.abstract && (
                  <div className="mt-4">
                    <label className="text-sm font-semibold text-muted-foreground">Abstract</label>
                    <p className="mt-3 text-sm leading-relaxed bg-muted/30 p-4 rounded-lg break-words">{potential.applications.abstract}</p>
                  </div>
                )}
              </>
            )}
            {potential.contact_email && (
              <div className="pt-4 border-t">
                <label className="text-sm font-semibold text-muted-foreground">Contact Email</label>
                <p className="mt-2 text-base break-words">{potential.contact_email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Progress */}
        <Card className="w-full max-w-full overflow-hidden">{/* ✅ fix */}
          <CardHeader>
            <CardTitle>Action Progress</CardTitle>
          </CardHeader>
          <CardContent className="py-8">
            <ProcessingSteps currentActionStep={potential.progress_stage || 0} onActionStepClick={onActionStepClick} />
          </CardContent>
        </Card>

        {/* Evaluation Chart */}
        <Card className="w-full max-w-full overflow-hidden">{/* ✅ fix */}
          <CardHeader>
            <CardTitle>Evaluation Scores</CardTitle>
          </CardHeader>
          <CardContent className="py-8">
            {criteriaScores.length > 0 ? (
              <div className="w-full max-w-full overflow-hidden">{/* ✅ fix */}
                <SpiderChart criteriaScores={criteriaScores} />
              </div>
            ) : (
              <div className="text-muted-foreground text-center">
                No criteria scores available for this potential. Found {criteriaScores.length} criteria scores.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Criteria Scores */}
        {criteriaScores.length > 0 && (
          <Card className="w-full max-w-full overflow-hidden">{/* ✅ fix */}
            <CardHeader>
              <CardTitle>Detailed Criteria Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {criteriaScores.map((score) => (
                <div key={score.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-sm leading-relaxed break-words">{score.criterion || 'Unknown Criterion'}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">Score: {score.score?.toFixed(1) || 'N/A'}</Badge>
                      <Badge variant="secondary" className="text-xs">Confidence: {score.confidence ? `${(score.confidence * 100).toFixed(0)}%` : 'N/A'}</Badge>
                    </div>
                  </div>
                  {score.rationale && (
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rationale</label>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded break-words">{score.rationale}</p>
                    </div>
                  )}
                  {score.evidence && (
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Evidence</label>
                      <p className="mt-2 text-sm text-foreground leading-relaxed bg-green-50 dark:bg-green-950/20 p-3 rounded border-l-4 border-green-500 break-words">
                        {score.evidence}
                      </p>
                    </div>
                  )}
                  {score.missing_data && score.missing_data !== 'None' && (
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Missing Data</label>
                      <p className="mt-2 text-sm text-foreground leading-relaxed bg-amber-50 dark:bg-amber-950/20 p-3 rounded border-l-4 border-amber-500 break-words">
                        {score.missing_data}
                      </p>
                    </div>
                  )}
                  {score.raw && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Raw Data</label>
                      <pre className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-x-auto whitespace-pre-wrap break-words">
                        {JSON.stringify(score.raw, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card className="w-full max-w-full overflow-hidden">{/* ✅ fix */}
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              placeholder="Add your notes about this potential..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              className="w-full max-w-full" // ✅ fix
            />
            <Button onClick={handleSaveNotes} disabled={isSavingNotes} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {isSavingNotes ? 'Saving...' : 'Save Notes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PotentialDetail;