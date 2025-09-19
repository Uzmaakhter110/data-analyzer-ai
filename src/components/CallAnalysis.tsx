import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Square, AlertTriangle, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CallAnalysisProps {
  onCallAnalyzed: (analysis: any) => void;
}

export const CallAnalysis = ({ onCallAnalyzed }: CallAnalysisProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [liveFlags, setLiveFlags] = useState<string[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        // Simulate live analysis
        if (Math.random() > 0.7) {
          simulateLiveAnalysis();
        }
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const simulateLiveAnalysis = () => {
    const mockTranscripts = [
      "Hei, takk for at du ringer...",
      "Vi har et spesialtilbud i dag...",
      "Dette produktet er perfekt for deg...",
      "Prisen er kun gyldig i dag...",
      "Du må bestemme deg nå..."
    ];
    
    const mockFlags = [
      "High pressure sales language detected",
      "Unrealistic urgency claims",
      "Potential misleading pricing information"
    ];

    setCurrentTranscript(prev => prev + " " + mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)]);
    
    if (Math.random() > 0.8) {
      const newFlag = mockFlags[Math.floor(Math.random() * mockFlags.length)];
      setLiveFlags(prev => [...prev, newFlag]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      // Set up audio level monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Monitor audio levels
      const monitorAudio = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        if (isRecording) {
          requestAnimationFrame(monitorAudio);
        }
      };
      monitorAudio();

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start(1000); // Capture in 1-second chunks
      
      setIsRecording(true);
      setCurrentTranscript("");
      setLiveFlags([]);
      
      toast({
        title: "Recording started",
        description: "Live Norwegian analysis is active"
      });

    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsRecording(false);
    setIsAnalyzing(true);
    
    // Simulate final analysis
    setTimeout(() => {
      const finalAnalysis = {
        id: Date.now(),
        fileName: `Live Recording ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toISOString(),
        transcription: currentTranscript,
        qualityScore: liveFlags.length > 2 ? 35 : liveFlags.length > 0 ? 65 : 88,
        flags: liveFlags,
        duration: `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`,
        language: "Norwegian (Live)",
        confidence: 89
      };
      
      onCallAnalyzed(finalAnalysis);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis complete",
        description: `Live call analyzed with ${finalAnalysis.qualityScore}% quality score`
      });
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Real-time Call Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className="w-16 h-16 rounded-full"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
              >
                {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
              {isRecording && (
                <div className="absolute -inset-2 rounded-full border-2 border-red-500 animate-pulse" />
              )}
            </div>
            
            <div className="text-center space-y-2">
              <p className="font-medium">
                {isRecording ? "Recording..." : isAnalyzing ? "Analyzing..." : "Ready to record"}
              </p>
              {isRecording && (
                <p className="text-lg font-mono">{formatTime(recordingTime)}</p>
              )}
            </div>

            {isRecording && (
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-100"
                    style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {currentTranscript && (
            <div>
              <h4 className="font-medium mb-2">Live Transcription:</h4>
              <div className="bg-muted p-3 rounded text-sm min-h-[100px]">
                {currentTranscript}
                {isRecording && <span className="animate-pulse">|</span>}
              </div>
            </div>
          )}

          {liveFlags.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Live Quality Alerts:
              </h4>
              <div className="space-y-2">
                {liveFlags.map((flag, index) => (
                  <Badge key={index} variant="outline" className="text-yellow-600 border-yellow-200">
                    {flag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h5 className="font-medium">Norwegian Language Support</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Bokmål and Nynorsk recognition</li>
                <li>• Regional dialect understanding</li>
                <li>• Cultural context awareness</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium">Quality Detection</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Misleading information detection</li>
                <li>• High-pressure tactics identification</li>
                <li>• Customer concern analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};