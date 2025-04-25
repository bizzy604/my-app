'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, CheckCircle, Info, BarChart } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

interface AIAnalysisProps {
  bidId: string
  tenderId: string
  existingAnalysis?: {
    id: string
    initialScreeningScore: number
    complianceScore: number
    riskAssessmentScore: number
    comparativeScore: number
    recommendationScore: number
    initialScreeningReport: string
    complianceReport: string
    riskAssessmentReport: string
    comparativeReport: string
    recommendationReport: string
    createdAt: Date
  } | null
}

export function AIAnalysisPanel({ bidId, tenderId, existingAnalysis }: AIAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState(existingAnalysis)
  const [canUseAI, setCanUseAI] = useState(false)
  const { toast } = useToast()

  // Check if user has access to AI features
  useEffect(() => {
    const checkAIAccess = async () => {
      try {
        const response = await fetch('/api/user/subscription-access?tier=ai')
        if (response.ok) {
          const data = await response.json()
          setCanUseAI(data.hasAccess)
        } else {
          setCanUseAI(false)
        }
      } catch (error) {
        console.error('Error checking AI access:', error)
        setCanUseAI(false)
      }
    }
    
    checkAIAccess()
  }, [])

  const checkStatus = async (kickoffId: string) => {
    try {
      const response = await fetch(`/api/crewai/ai-agents?kickoff_id=${kickoffId}`);
      if (!response.ok) {
        console.error('Error checking status:', await response.text());
        return;
      }
      
      const data = await response.json();
      console.log('Status check response:', data);
      
      if (data.status === 'completed' && data.result) {
        console.log('Analysis complete with results:', data.result);
        // Analysis is complete, save results to database
        try {
          // The result will contain the AggregateResults structure with 5 components
          // Ensure it has the expected structure before saving
          if (!data.result.document_analyst || !data.result.initial_screening || 
              !data.result.compliance || !data.result.risk_assessment || 
              !data.result.award_recommendation) {
            console.warn('Unexpected result structure from CrewAI:', data.result);
          }
          
          const saveResponse = await fetch('/api/crewai/ai-analysis/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bidId,
              tenderId,
              analysisData: data.result
            })
          })
          
          if (saveResponse.ok) {
            const savedData = await saveResponse.json();
            setAnalysis(savedData.analysis);
            setIsLoading(false);
            toast({
              title: "Analysis Complete",
              description: "AI analysis has been completed and saved.",
            });
          } else {
            throw new Error('Failed to save analysis');
          }
        } catch (error) {
          console.error('Error saving analysis:', error);
          setIsLoading(false);
          toast({
            title: "Error",
            description: "Analysis completed but failed to save results.",
            variant: "destructive"
          });
        }
      } else if (data.status === 'failed') {
        // Analysis failed
        setIsLoading(false);
        toast({
          title: "Analysis Failed",
          description: "Failed to complete AI analysis. Please try again.",
          variant: "destructive"
        });
      } else {
        // Continue polling
        setTimeout(() => checkStatus(kickoffId), 5000); // Check every 5 seconds
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to check analysis status.",
        variant: "destructive"
      });
    }
  };

  const runAIAnalysis = async () => {
    // If user doesn't have AI access, show error and return
    if (!canUseAI) {
      toast({
        title: "Subscription Required",
        description: "You need an AI subscription tier to use this feature. Please upgrade your plan.",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    try {
      // First fetch the complete bid data
      const bidResponse = await fetch(`/api/bids/${bidId}`)
      if (!bidResponse.ok) {
        throw new Error('Failed to fetch bid data')
      }
      const bidData = await bidResponse.json()
      
      // Now send the complete bid data to the AI analysis endpoint
      const response = await fetch('/api/crewai/ai-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bidData,  // bidData is the bid object directly, not nested
          tender: bidData.tender || { id: tenderId }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to run AI analysis')
      }

      const data = await response.json()
      console.log('AI analysis API response:', data)

      // Extract the kickoff_id from the response
      const kickoffId = data.kickoff_id
      
      if (kickoffId) {
        // We have a kickoff_id, start polling for status
        console.log('Starting status polling with kickoff_id:', kickoffId)
        toast({
          title: "Analysis Started",
          description: "AI analysis is in progress.",
        })
        
        // Start polling for results
        checkStatus(kickoffId)
      } else if (data.document_analyst || data.initial_screening) {
        // This is the actual analysis data returned directly, save it to our database
        try {
          const saveResponse = await fetch('/api/crewai/ai-analysis/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bidId,
              tenderId,
              analysisData: data
            })
          })
          
          if (saveResponse.ok) {
            const savedData = await saveResponse.json()
            setAnalysis(savedData.analysis)
            toast({
              title: "Analysis Complete",
              description: "AI analysis has been completed and saved."
            })
          } else {
            throw new Error('Failed to save analysis')
          }
        } catch (error) {
          console.error('Error saving analysis:', error)
          toast({
            title: "Error",
            description: "Analysis completed but failed to save results.",
            variant: "destructive"
          })
        }
      } else {
        // Just a confirmation that the analysis has started
        toast({
          title: "Analysis Started",
          description: "AI analysis is in progress."
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error('AI analysis error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to run AI analysis",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (score >= 60) return <Info className="h-5 w-5 text-blue-500" />
    return <AlertTriangle className="h-5 w-5 text-amber-500" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-blue-500"
    return "bg-amber-500"
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis</CardTitle>
          <CardDescription>
            Use AI agents to analyze this bid and get comprehensive insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <BarChart className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-center text-gray-500 mb-6">
              No AI analysis has been performed on this bid yet. Run an analysis to get insights from our AI agents.
            </p>
            <Button 
              onClick={runAIAnalysis} 
              disabled={isLoading || !canUseAI}
              className={`w-full md:w-auto ${
                !canUseAI ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Analysis...
                </>
              ) : (
                canUseAI ? "Run AI Analysis" : "AI Analysis (Requires Subscription)"
              )}
            </Button>
            {!canUseAI && (
              <div className="text-sm text-gray-600 mt-2">
                AI analysis requires an Innobid AI subscription. 
                <a href="/pricing" className="ml-1 underline text-blue-600">
                  Upgrade your plan
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>AI Analysis</CardTitle>
            <CardDescription>
              Analysis performed on {formatDate(analysis.createdAt)}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={runAIAnalysis} 
            disabled={isLoading || !canUseAI}
            className={!canUseAI ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100' : ''}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              canUseAI ? "Update Analysis" : "Update (Requires Subscription)"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="screening">Screening</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
            <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <div className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">Initial Screening</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{analysis.initialScreeningScore.toFixed(1)}</span>
                      {getScoreIcon(analysis.initialScreeningScore)}
                    </div>
                    <div className="mt-2">
                      <Progress 
                        value={analysis.initialScreeningScore} 
                        className="h-2"
                      />
                      <div
                        className={`h-1 mt-0.5 rounded-full ${getScoreColor(analysis.initialScreeningScore)}`} 
                        style={{width: `${analysis.initialScreeningScore}%`}}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">Compliance</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{analysis.complianceScore.toFixed(1)}</span>
                      {getScoreIcon(analysis.complianceScore)}
                    </div>
                    <div className="mt-2">
                      <Progress 
                        value={analysis.complianceScore} 
                        className="h-2"
                      />
                      <div 
                        className={`h-1 mt-0.5 rounded-full ${getScoreColor(analysis.complianceScore)}`} 
                        style={{width: `${analysis.complianceScore}%`}}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{analysis.riskAssessmentScore.toFixed(1)}</span>
                      {getScoreIcon(analysis.riskAssessmentScore)}
                    </div>
                    <div className="mt-2">
                      <Progress 
                        value={analysis.riskAssessmentScore} 
                        className="h-2"
                      />
                      <div 
                        className={`h-1 mt-0.5 rounded-full ${getScoreColor(analysis.riskAssessmentScore)}`} 
                        style={{width: `${analysis.riskAssessmentScore}%`}}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{analysis.recommendationScore.toFixed(1)}</span>
                      {getScoreIcon(analysis.recommendationScore)}
                    </div>
                    <div className="mt-2">
                      <Progress 
                        value={analysis.recommendationScore} 
                        className="h-2"
                      />
                      <div 
                        className={`h-1 mt-0.5 rounded-full ${getScoreColor(analysis.recommendationScore)}`} 
                        style={{width: `${analysis.recommendationScore}%`}}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Key Findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Recommendation Summary</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {analysis.recommendationReport.split('\n')[0]}
                      </p>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium">Strengths</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                          {analysis.recommendationReport
                            .split('\n')
                            .filter(line => line.includes('Strength') || line.includes('strength'))
                            .slice(0, 3)
                            .map((line, i) => (
                              <li key={i}>{line.replace(/^[^:]*:\s*/, '')}</li>
                            ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Concerns</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                          {analysis.riskAssessmentReport
                            .split('\n')
                            .filter(line => line.includes('Risk') || line.includes('risk') || line.includes('Concern'))
                            .slice(0, 3)
                            .map((line, i) => (
                              <li key={i}>{line.replace(/^[^:]*:\s*/, '')}</li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="screening">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Initial Screening Report</CardTitle>
                <CardDescription>
                  Score: {analysis.initialScreeningScore.toFixed(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">
                  {analysis.initialScreeningReport}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="compliance">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Compliance Report</CardTitle>
                <CardDescription>
                  Score: {analysis.complianceScore.toFixed(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">
                  {analysis.complianceReport}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="risk">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Risk Assessment Report</CardTitle>
                <CardDescription>
                  Score: {analysis.riskAssessmentScore.toFixed(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">
                  {analysis.riskAssessmentReport}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommendation">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Award Recommendation</CardTitle>
                <CardDescription>
                  Score: {analysis.recommendationScore.toFixed(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">
                  {analysis.recommendationReport}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 