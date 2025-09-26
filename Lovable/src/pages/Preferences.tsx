import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, RotateCcw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface CriteriaPreference {
  name: string;
  description: string;
  factor: number;
  scale: {
    best: string;
    worst: string;
  };
}
const defaultCriteria: CriteriaPreference[] = [{
  name: "Novelty / Originality of Idea",
  description: "How fundamentally new is the underlying concept compared to existing approaches?",
  factor: 3,
  scale: {
    best: "Radically new paradigm",
    worst: "Incremental improvement"
  }
}, {
  name: "Technological Feasibility",
  description: "Does the research provide a credible path toward a working prototype or MVP within 3–5 years?",
  factor: 3,
  scale: {
    best: "Strong evidence/proven feasibility",
    worst: "Highly speculative"
  }
}, {
  name: "Scalability",
  description: "Can the concept scale technically and economically if proven?",
  factor: 3,
  scale: {
    best: "Globally scalable",
    worst: "Niche/limited scope"
  }
}, {
  name: "Impact Potential (Societal/Economic)",
  description: "If successful, how large is the potential impact? (economic disruption, societal transformation, sustainability, health, etc.)",
  factor: 3,
  scale: {
    best: "Transformative impact",
    worst: "Marginal impact"
  }
}, {
  name: "Alignment with SPRIN-D \"Breakthrough\" Spirit",
  description: "Is this a potential \"Sprunginnovation\" (leapfrog innovation) rather than optimization of existing solutions?",
  factor: 3,
  scale: {
    best: "Clear breakthrough innovation",
    worst: "Optimization of existing solutions"
  }
}, {
  name: "Market / Application Potential",
  description: "Is there a plausible application that could evolve into a product/startup with demand?",
  factor: 3,
  scale: {
    best: "Obvious market demand",
    worst: "Unclear market fit"
  }
}, {
  name: "Time Horizon to Market Readiness",
  description: "Is the path to first commercializable use aligned with SPRIN-D's funding horizon (years, not decades)?",
  factor: 3,
  scale: {
    best: "Within ~3–7 years",
    worst: "15+ years away"
  }
}, {
  name: "Team / Research Excellence",
  description: "Does the research team have the credibility, expertise, and momentum to push toward a venture?",
  factor: 3,
  scale: {
    best: "World-class and entrepreneurial",
    worst: "Weak/fragmented team"
  }
}, {
  name: "Risk/Return Balance",
  description: "Is the risk high, but with outsized potential payoff (SPRIN-D tolerates high risk, but expects big upside)?",
  factor: 3,
  scale: {
    best: "High risk/high transformative return",
    worst: "Low risk/low return"
  }
}, {
  name: "Strategic Fit for Germany/Europe",
  description: "Does this strengthen technological sovereignty or strategic independence (e.g., energy, AI, biotech)?",
  factor: 3,
  scale: {
    best: "Critical for EU competitiveness",
    worst: "Little strategic relevance"
  }
}];
export default function Preferences() {
  const [criteria, setCriteria] = useState<CriteriaPreference[]>(defaultCriteria);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const {
    toast
  } = useToast();

  // Load preferences from Supabase on component mount
  useEffect(() => {
    loadPreferences();
  }, []);
  const loadPreferences = async () => {
    try {
      const {
        data: preferences,
        error
      } = await supabase.from('criteria_preferences').select('criterion, factor');
      if (error) throw error;
      if (preferences && preferences.length > 0) {
        // Update criteria with saved preferences
        const updatedCriteria = defaultCriteria.map(criterion => {
          const savedPreference = preferences.find(p => p.criterion === criterion.name);
          return savedPreference ? {
            ...criterion,
            factor: savedPreference.factor
          } : criterion;
        });
        setCriteria(updatedCriteria);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load preferences. Using defaults.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleFactorChange = (index: number, newFactor: number[]) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[index].factor = newFactor[0];
    setCriteria(updatedCriteria);
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      // Update global preferences (one row per criterion)
      const updates = criteria.map(criterion => supabase.from('criteria_preferences').upsert({
        criterion: criterion.name,
        factor: criterion.factor
      }, {
        onConflict: 'criterion'
      }));
      const results = await Promise.all(updates);

      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Failed to save some preferences');
      }
      toast({
        title: "Preferences Saved",
        description: "Updated scoring criteria factors successfully"
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  const handleReset = async () => {
    setSaving(true);
    try {
      // Reset all criteria to factor 3 (default)
      const updates = criteria.map(criterion => supabase.from('criteria_preferences').upsert({
        criterion: criterion.name,
        factor: 3
      }, {
        onConflict: 'criterion'
      }));
      const results = await Promise.all(updates);

      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Failed to reset some preferences');
      }
      setCriteria(defaultCriteria);
      toast({
        title: "Preferences Reset",
        description: "All scoring preferences have been reset to default values"
      });
    } catch (error) {
      console.error('Error resetting preferences:', error);
      toast({
        title: "Error",
        description: "Failed to reset preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading preferences...</span>
        </div>
      </div>;
  }
  return <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Evaluation Preferences</h1>
            <p className="text-muted-foreground">
          </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleReset} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Criteria Cards */}
      <div className="grid gap-6">
        {criteria.map((criterion, index) => <Card key={criterion.name} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">{criterion.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {criterion.description}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-4 text-sm font-medium">
                  Factor: {criterion.factor}x
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Factor Slider */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Importance Factor: {criterion.factor}x
                </Label>
                <Slider value={[criterion.factor]} onValueChange={value => handleFactorChange(index, value)} max={5} min={1} step={1} className="w-full" />
              </div>

              {/* Scoring Scale */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-green-600 uppercase tracking-wide">
                    Best Score (1)
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {criterion.scale.best}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-red-600 uppercase tracking-wide">
                    Worst Score (5)
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {criterion.scale.worst}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}