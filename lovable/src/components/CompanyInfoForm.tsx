import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
// Removed unused constants
import { Building2, Mail, DollarSign, MapPin, TrendingUp, Briefcase } from 'lucide-react';

interface CompanyInfo {
  companyName: string;
  contactEmail: string;
  stage: string;
  sector: string;
  geography: string;
  ticketSize: string;
}

interface CompanyInfoFormProps {
  onSubmit: (data: CompanyInfo) => void;
  isLoading: boolean;
  extractedData?: Partial<CompanyInfo>;
}

const CompanyInfoForm = ({ onSubmit, isLoading, extractedData }: CompanyInfoFormProps) => {
  const [formData, setFormData] = useState<CompanyInfo>({
    companyName: extractedData?.companyName || '',
    contactEmail: extractedData?.contactEmail || '',
    stage: extractedData?.stage || '',
    sector: extractedData?.sector || '',
    geography: extractedData?.geography || '',
    ticketSize: extractedData?.ticketSize || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Company Information
        </CardTitle>
        <CardDescription>
          Review and complete the extracted information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Name *
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                required
                disabled={isLoading}
                placeholder="Enter company name"
              />
            </div>

            <div>
              <Label htmlFor="contactEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Email *
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                required
                disabled={isLoading}
                placeholder="contact@company.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stage" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Stage *
                </Label>
                <Select 
                  value={formData.stage} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sector" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Sector *
                </Label>
                <Select 
                  value={formData.sector} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="healthtech">HealthTech</SelectItem>
                    <SelectItem value="ai">AI/ML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="geography" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Geography *
                </Label>
                <Select 
                  value={formData.geography} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, geography: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select geography" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ticketSize" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Ticket Size ($)
                </Label>
                <Input
                  id="ticketSize"
                  type="number"
                  value={formData.ticketSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, ticketSize: e.target.value }))}
                  disabled={isLoading}
                  placeholder="1000000"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Start Analysis'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoForm;