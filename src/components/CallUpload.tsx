import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileAudio, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CallUploadProps {
  onCallAnalyzed: (analysis: any) => void;
}

export const CallUpload = ({ onCallAnalyzed }: CallUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setAnalysisResult(null);

    try {
      // Simulate transcription progress
      for (let i = 0; i <= 50; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate AI analysis
      for (let i = 60; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Mock analysis result
      const mockAnalysis = {
        id: Date.now(),
        fileName: file.name,
        timestamp: new Date().toISOString(),
        transcription: "Hei, dette er en mock transkripsjon av samtalen. Agenten presenterte produktet og kunden stilte spørsmål om prisen.",
        qualityScore: Math.random() > 0.3 ? 85 : 45,
        flags: Math.random() > 0.3 ? [] : [
          "Potential misleading information about pricing",
          "Customer concerns not adequately addressed"
        ],
        duration: "3:42",
        language: "Norwegian (Bokmål)",
        confidence: 92
      };

      setAnalysisResult(mockAnalysis);
      onCallAnalyzed(mockAnalysis);

      toast({
        title: "Analysis complete",
        description: `Call analyzed with ${mockAnalysis.qualityScore}% quality score`
      });

    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the call. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Call Recording
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileAudio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop your audio file here</p>
            <p className="text-muted-foreground mb-4">
              Supports MP3, WAV, M4A and other audio formats
            </p>
            <Button variant="outline">
              Select File
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing call...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {progress < 50 ? "Transcribing Norwegian audio..." : "Analyzing for quality issues..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Analysis Results
              <div className="flex items-center gap-2">
                {analysisResult.qualityScore >= 70 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <span className={`font-bold ${analysisResult.qualityScore >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {analysisResult.qualityScore}%
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Duration:</span> {analysisResult.duration}
              </div>
              <div>
                <span className="font-medium">Language:</span> {analysisResult.language}
              </div>
              <div>
                <span className="font-medium">Confidence:</span> {analysisResult.confidence}%
              </div>
              <div>
                <span className="font-medium">File:</span> {analysisResult.fileName}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Transcription:</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {analysisResult.transcription}
              </p>
            </div>

            {analysisResult.flags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-yellow-600">Quality Flags:</h4>
                <ul className="space-y-1">
                  {analysisResult.flags.map((flag, index) => (
                    <li key={index} className="text-sm text-yellow-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};