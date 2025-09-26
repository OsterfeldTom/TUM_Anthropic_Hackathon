import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload as UploadIcon, FileText, ArrowRight } from 'lucide-react';
import ProcessingSteps from '@/components/ProcessingSteps';
import CompanyInfoForm from '@/components/CompanyInfoForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [showSplit, setShowSplit] = useState(false);
  const navigate = useNavigate();

  const validateFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      return false;
    }
    if (selectedFile.size > 40 * 1024 * 1024) {
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      handleFileUpload(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const { toast } = useToast();

  const handleFileUpload = async (selectedFile: File) => {
    setIsProcessing(true);
    setShowSplit(true);
    setProcessingStep(0);

    try {
      setProcessingStep(1);

      // Create application record first
      const { data: applicationData, error: applicationError } = await supabase
        .from('applications')
        .insert({
          status: 'uploaded',
          research_title: selectedFile.name.replace('.pdf', ''),
        })
        .select()
        .single();

      if (applicationError || !applicationData) {
        throw new Error('Failed to create application record');
      }

      // Show upload progress for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProcessingStep(2);

      // Upload file to storage
      const fileName = `public/${applicationData.id}/${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('research-papers')
        .upload(fileName, selectedFile, {
          upsert: false,
        });

      if (uploadError) {
        throw new Error('Failed to upload file: ' + uploadError.message);
      }

      // Show extracting info for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      setProcessingStep(3);

      // Update application with file path
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          pdf_storage_path: uploadData.path,
        })
        .eq('id', applicationData.id);

      if (updateError) {
        throw new Error('Failed to update application with file path');
      }

      // Trigger processing webhook
      const { error: processError } = await supabase.functions.invoke('process-research-paper', {
        body: {
          file_path: uploadData.path,
          application_id: applicationData.id,
        },
      });

      if (processError) {
        console.error('Error triggering processing:', processError);
        // Don't throw here, as the file is uploaded successfully
      }

      // Poll for status change to "processed"
      const pollForProcessing = async () => {
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max
        
        while (attempts < maxAttempts) {
          const { data: updatedApplication } = await supabase
            .from('applications')
            .select('status')
            .eq('id', applicationData.id)
            .single();

          if (updatedApplication?.status === 'processed') {
            // Show success notification only when processing is complete
            toast({
              title: "Processing complete",
              description: "Your research paper has been successfully analyzed and is ready for review.",
            });
            
            // Navigate to applications page when processing is complete
            navigate('/applications');
            return;
          }

          await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
          attempts++;
        }

        // If polling times out, still navigate but show a message
        toast({
          title: "Processing in progress",
          description: "Your document is still being processed. You can check the status in the applications page.",
        });
        navigate('/applications');
      };

      pollForProcessing();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload research paper",
        variant: "destructive",
      });
      setIsProcessing(false);
      setShowSplit(false);
    }
  };

  if (showSplit) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-gradient-to-br from-secondary/30 to-accent/20">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-2xl font-semibold mb-8 text-center text-foreground">Processing Research Paper</h2>
          <ProcessingSteps currentProcessingStep={processingStep} currentActionStep={0} />
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Please wait while we process your document...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-6 bg-gradient-to-br from-background via-secondary/20 to-accent/30">
      <Card className="w-full max-w-2xl shadow-xl border-primary/20">
        <CardHeader className="text-center pb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Upload Research Paper</CardTitle>
          <p className="text-muted-foreground mt-2">
            Drop your research paper PDF here to start the AI-powered analysis
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              isDragOver 
                ? 'border-primary bg-primary/10 scale-105' 
                : 'border-border hover:border-primary/50 hover:bg-accent/20'
            } ${file ? 'border-success bg-success/5' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-full bg-accent/20 mb-4">
                <UploadIcon className="h-12 w-12 text-primary" />
              </div>
              
              {file ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-success">
                    {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button 
                      onClick={() => handleFileUpload(file)}
                      className="flex items-center gap-2"
                    >
                      Start Analysis <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-medium text-foreground mb-2">
                      Drop your research paper here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF files up to 40MB
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file')?.click()}
                      className="flex items-center gap-2"
                    >
                      <UploadIcon className="h-4 w-4" />
                      Browse Files
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;