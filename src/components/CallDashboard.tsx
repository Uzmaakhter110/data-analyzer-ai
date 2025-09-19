import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, Search, Filter, Play, Download } from "lucide-react";

interface Call {
  id: number;
  fileName: string;
  timestamp: string;
  qualityScore: number;
  flags: string[];
  duration: string;
  language: string;
  confidence: number;
  transcription: string;
}

interface CallDashboardProps {
  calls: Call[];
}

export const CallDashboard = ({ calls }: CallDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.transcription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === "all" || 
                         (filterBy === "flagged" && call.flags.length > 0) ||
                         (filterBy === "good" && call.flags.length === 0);
    
    return matchesSearch && matchesFilter;
  });

  const totalCalls = calls.length;
  const flaggedCalls = calls.filter(call => call.flags.length > 0).length;
  const averageScore = calls.length > 0 ? 
    Math.round(calls.reduce((sum, call) => sum + call.qualityScore, 0) / calls.length) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold">{totalCalls}</p>
              </div>
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flagged Calls</p>
                <p className="text-2xl font-bold text-yellow-600">{flaggedCalls}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold text-green-600">{averageScore}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search calls by filename or transcription..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Calls</SelectItem>
                <SelectItem value="flagged">Flagged Only</SelectItem>
                <SelectItem value="good">Good Quality</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calls List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Call History ({filteredCalls.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredCalls.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {calls.length === 0 ? "No calls analyzed yet" : "No calls match your search"}
                </p>
              ) : (
                filteredCalls.map((call) => (
                  <div
                    key={call.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedCall?.id === call.id ? 'border-primary bg-muted/50' : ''
                    }`}
                    onClick={() => setSelectedCall(call)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium truncate">{call.fileName}</h4>
                      <div className="flex items-center gap-2">
                        {call.qualityScore >= 70 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          call.qualityScore >= 70 ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {call.qualityScore}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>{new Date(call.timestamp).toLocaleString()}</span>
                      <span>{call.duration}</span>
                    </div>
                    
                    {call.flags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {call.flags.slice(0, 2).map((flag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {flag.length > 30 ? flag.substring(0, 30) + '...' : flag}
                          </Badge>
                        ))}
                        {call.flags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{call.flags.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call Details */}
        <Card>
          <CardHeader>
            <CardTitle>Call Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCall ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{selectedCall.fileName}</h3>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Quality Score:</span>
                    <span className={`ml-2 font-bold ${
                      selectedCall.qualityScore >= 70 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {selectedCall.qualityScore}%
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span>
                    <span className="ml-2">{selectedCall.duration}</span>
                  </div>
                  <div>
                    <span className="font-medium">Language:</span>
                    <span className="ml-2">{selectedCall.language}</span>
                  </div>
                  <div>
                    <span className="font-medium">Confidence:</span>
                    <span className="ml-2">{selectedCall.confidence}%</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Transcription:</h4>
                  <div className="bg-muted p-3 rounded text-sm max-h-[200px] overflow-y-auto">
                    {selectedCall.transcription}
                  </div>
                </div>

                {selectedCall.flags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-yellow-600">Quality Issues:</h4>
                    <div className="space-y-2">
                      {selectedCall.flags.map((flag, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-yellow-600">{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Select a call to view details
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};