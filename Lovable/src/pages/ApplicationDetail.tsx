import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Building, 
  Mail, 
  Tag, 
  MapPin, 
  Calendar, 
  User, 
  FileText, 
  Globe,
  Loader2,
  Download,
  DollarSign,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Application = Database['public']['Tables']['applications']['Row'];

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  // Fetch application details
  const fetchApplication = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching application:', error);
        toast({
          title: "Error",
          description: "Failed to fetch application details. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setApplication(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Download PDF function
  const downloadPDF = async () => {
    if (!application?.pdf_storage_path) return;
    
    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from('research-papers')
        .download(application.pdf_storage_path);

      if (error) {
        toast({
          title: "Download Error",
          description: "Failed to download the PDF file.",
          variant: "destructive",
        });
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${application.research_title || 'research-paper'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Complete",
        description: "PDF file has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Error",
        description: "An unexpected error occurred during download.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Start deep analysis function
  const startDeepAnalysis = async () => {
    if (!application?.id) return;
    
    setAnalyzing(true);
    try {
      // Prepare payload
      const payload: any = { application_id: application.id };
      
      // Generate signed URL for PDF if available
      if (application.pdf_storage_path) {
        const { data: urlData, error: urlError } = await supabase.storage
          .from('research-papers')
          .createSignedUrl(application.pdf_storage_path, 3600); // 1 hour expiry
        
        if (urlError) {
          console.error('Error generating signed URL:', urlError);
        } else if (urlData?.signedUrl) {
          payload.pdf_url = urlData.signedUrl;
        }
        payload.pdf_storage_path = application.pdf_storage_path;
      }

      // Invoke Supabase edge function (preferred)
      const { data: fnData, error: fnError } = await supabase.functions.invoke('deep-analysis', {
        body: payload
      });

      if (fnError) {
        console.error('Deep analysis function error:', fnError);
        toast({
          title: 'Analysis Error',
          description: 'Failed to start deep analysis.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Analysis Started',
          description: 'Deep analysis has been initiated.',
        });
      }
      
      // Refresh the application data to show any updated status
      await fetchApplication();
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Error',
        description: 'An unexpected error occurred while starting analysis.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  // Get status color for badge
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'uploaded': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-emerald-100 text-emerald-800';
      case 'under_review': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_revision': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading application details...</span>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Application not found</h3>
          <p className="text-muted-foreground mb-4">
            The application you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/applications')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/applications')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight break-words">
              {application.research_title || 'Untitled Research'}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {new Date(application.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {application.pdf_storage_path && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={downloadPDF}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {downloading ? 'Downloading...' : 'Download PDF'}
              </Button>
            )}
            <Button 
              size="sm" 
              className="gap-2"
              onClick={startDeepAnalysis}
              disabled={analyzing || application.status !== 'processed'}
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              {analyzing ? 'Analyzing...' : 'Start Deep Analysis'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Research Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Research Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.research_area && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Research Area</label>
                  <p className="mt-1">{application.research_area}</p>
                </div>
              )}
              
              
              {application.abstract && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Abstract</label>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                    {application.abstract}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{application.contact_email}</span>
                </div>
              )}
              
              {application.institution && (
                <div className="flex items-start gap-2">
                  <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{application.institution}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Meta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Application Meta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Application ID</label>
                <p className="text-sm font-mono mt-1 break-all">{application.id}</p>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm mt-1">
                  {new Date(application.created_at).toLocaleString()}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm mt-1">
                  {new Date(application.updated_at).toLocaleString()}
                </p>
              </div>
              
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}