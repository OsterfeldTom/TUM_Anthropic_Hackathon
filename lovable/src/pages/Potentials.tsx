import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Potential } from '@/types/potentials';
import { Upload, Plus } from 'lucide-react';

const Potentials = () => {
  const [potentials, setPotentials] = useState<Potential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all'
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const getActionStage = (progressStage: number | null) => {
    const stages = ['Applied', 'Deep AI Analysis', 'Data Enrichment Call'];
    if (progressStage === null || progressStage === undefined) return 'Applied';
    return stages[progressStage] || 'Applied';
  };

  const getActionStageColor = (progressStage: number | null) => {
    if (progressStage === null || progressStage === undefined) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    switch (progressStage) {
      case 0:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 1:
        return 'bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100';
      case 2:
        return 'bg-blue-300 text-blue-950 dark:bg-blue-700 dark:text-blue-50';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const clearAllFilters = () => {
    setFilters({
      status: 'all'
    });
    setSearchTerm('');
  };

  const fetchPotentials = async () => {
    try {
      setIsLoading(true);
      let query = supabase.from('potentials').select(`
        *,
        applications(research_title, author, institution)
      `).order('avg_score', {
        ascending: true,
        nullsFirst: false
      }).order('created_at', {
        ascending: false
      });
      const { data, error } = await query;
      if (error) throw error;
      setPotentials(data || []);
    } catch (error: any) {
      console.error('Error fetching potentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load potentials.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPotentials();
  }, []);

  const filteredPotentials = potentials.filter(potential => {
    const matchesSearch = !searchTerm || 
      potential.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      potential.applications?.research_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      potential.applications?.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || potential.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-muted-foreground">Loading potentials...</div>
          <Button onClick={() => navigate('/upload')}>
            <Plus className="h-4 w-4 mr-2" />
            Upload New Application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Potentials Ranking</h1>
          <p className="text-muted-foreground">Applications ranked by overall evaluation score</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/upload')} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Application
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="Search applications, companies, authors..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              <Select value={filters.status} onValueChange={value => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="evaluated">Evaluated</SelectItem>
                  <SelectItem value="needs_review">Needs Review</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Potentials ({filteredPotentials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPotentials.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No potentials found</p>
              <Button onClick={() => navigate('/upload')}>Upload your first application</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Application / Company</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Confidence</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPotentials.map((potential, index) => (
                    <TableRow 
                      key={potential.id} 
                      className={`cursor-pointer hover:bg-muted/50 ${
                        potential.status === 'lost' ? 'text-red-600 dark:text-red-400' : 
                        potential.status === 'won' ? 'text-green-600 dark:text-green-400' : ''
                      }`} 
                      onClick={() => navigate(`/potentials/${potential.id}`)}
                    >
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{potential.applications?.research_title || potential.company_name || 'Unnamed Application'}</span>
                          {potential.applications?.institution && (
                            <span className="text-sm text-muted-foreground">{potential.applications.institution}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {potential.applications?.author || potential.contact_email || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {potential.avg_score ? (
                          <span className="text-2xl font-bold font-mono text-primary">{potential.avg_score.toFixed(1)}</span>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {potential.overall_confindence ? (
                          <span className="text-lg font-semibold font-mono text-muted-foreground">
                            {(parseFloat(potential.overall_confindence) * 100).toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionStageColor(potential.progress_stage)} variant="secondary">
                          {getActionStage(potential.progress_stage)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Potentials;