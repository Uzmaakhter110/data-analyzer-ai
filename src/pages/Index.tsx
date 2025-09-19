import { useState } from "react";
import { CallUpload } from "@/components/CallUpload";
import { CallAnalysis } from "@/components/CallAnalysis";
import { CallDashboard } from "@/components/CallDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [analyzedCalls, setAnalyzedCalls] = useState([]);

  const handleCallAnalyzed = (analysis) => {
    setAnalyzedCalls(prev => [...prev, analysis]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Norwegian Call Quality Analyzer</h1>
          <p className="text-muted-foreground">
            AI-powered analysis to detect misleading practices in call center conversations
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
            <TabsTrigger value="analysis">Real-time Analysis</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-6">
            <CallUpload onCallAnalyzed={handleCallAnalyzed} />
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-6">
            <CallAnalysis onCallAnalyzed={handleCallAnalyzed} />
          </TabsContent>
          
          <TabsContent value="dashboard" className="mt-6">
            <CallDashboard calls={analyzedCalls} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
