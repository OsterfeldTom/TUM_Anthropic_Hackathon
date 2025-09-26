import { NavLink } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Upload, BarChart3, Users, Zap, Shield, ArrowRight, CheckCircle } from 'lucide-react';
const Index = () => {
  return <div className="min-h-full bg-gradient-to-br from-background via-secondary/20 to-accent/30">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
              <Brain className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            <span className="text-primary">Analysa</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            AI-Powered Research Innovation Assessment Platform
          </p>
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">Evaluate breakthrough research innovations with criteria analysis, automated feasibility assessment, and intelligent investment insights.</p>
          
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button asChild size="lg" className="flex items-center gap-2">
              <NavLink to="/upload">
                <Upload className="h-5 w-5" />
                Upload Research Document
              </NavLink>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex items-center gap-2">
              <NavLink to="/potentials">
                <BarChart3 className="h-5 w-5" />
                View Potentials
              </NavLink>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>
                Advanced analysis system evaluates research innovations using SPRIN-D criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Novelty & feasibility assessment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Impact potential evaluation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Strategic fit analysis
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Automated Workflows</CardTitle>
              <CardDescription>
                Streamlined research evaluation from initial screening to funding recommendation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Instant document processing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Criteria scoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Breakthrough innovation tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Research Portfolio Management</CardTitle>
              <CardDescription>
                Comprehensive tracking and management of your research investment pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Real-time project tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Innovation analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  SPRIN-D reporting
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-12">How Analysa Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Upload & Process</h3>
              <p className="text-muted-foreground">
                Upload research papers, grant proposals, or innovation documents. Our AI instantly begins evaluation.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">AI Analysis</h3>
              <p className="text-muted-foreground">
                Advanced AI evaluates novelty, feasibility, scalability, and breakthrough innovation potential.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Make Decisions</h3>
              <p className="text-muted-foreground">
                Get comprehensive reports, SPRIN-D scores, and recommendations for research funding decisions.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Transform Your Potential Flow?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join leading research institutions who are using Analysa to evaluate breakthrough innovations 
              and make better-informed funding decisions.
            </p>
            <Button asChild size="lg" className="flex items-center gap-2 mx-auto">
              <NavLink to="/upload">
                Get Started Now <ArrowRight className="h-5 w-5" />
              </NavLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Index;