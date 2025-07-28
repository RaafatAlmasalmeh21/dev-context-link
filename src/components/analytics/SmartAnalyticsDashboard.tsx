import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  BarChart3, 
  Zap,
  Calendar,
  Brain,
  Trophy,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

export const SmartAnalyticsDashboard = () => {
  const { 
    analytics, 
    goals, 
    metrics, 
    insights, 
    isLoading, 
    generateProductivityInsights,
    createGoal 
  } = useAnalytics();
  
  const [timeRange, setTimeRange] = useState('30_days');

  const handleGenerateInsights = () => {
    generateProductivityInsights(timeRange);
  };

  const handleCreateGoal = async (type: string, target: number) => {
    await createGoal(type, target);
  };

  const formatEfficiency = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 0.9) return "text-green-600";
    if (score >= 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  const getGoalProgress = (goal: any) => {
    return Math.min(100, (goal.current_value / goal.target_value) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Smart Analytics
          </h2>
          <p className="text-muted-foreground">AI-powered productivity insights and goal tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7_days">7 Days</SelectItem>
              <SelectItem value="30_days">30 Days</SelectItem>
              <SelectItem value="90_days">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateInsights} disabled={isLoading}>
            <Brain className="h-4 w-4 mr-2" />
            {isLoading ? 'Analyzing...' : 'Generate Insights'}
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-xl font-bold">{metrics.completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Efficiency</p>
                  <p className={`text-xl font-bold ${getEfficiencyColor(metrics.avgEfficiency)}`}>
                    {formatEfficiency(metrics.avgEfficiency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-xl font-bold">{metrics.totalHours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  <p className="text-xl font-bold">{analytics.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        {insights && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.insights_summary && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{insights.insights_summary}</p>
                </div>
              )}

              {insights.efficiency_trend && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Trend:</span>
                  <Badge variant={
                    insights.efficiency_trend === 'improving' ? 'default' :
                    insights.efficiency_trend === 'declining' ? 'destructive' : 'secondary'
                  }>
                    {insights.efficiency_trend}
                  </Badge>
                </div>
              )}

              {insights.recommendations && insights.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {insights.recommendations.slice(0, 3).map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.goal_suggestions && insights.goal_suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Suggested Goals:</h4>
                  <div className="space-y-2">
                    {insights.goal_suggestions.slice(0, 2).map((goal: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-xs">{goal.reason}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCreateGoal(goal.type, goal.target)}
                        >
                          Set Goal
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Active Goals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Active Goals
              </CardTitle>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleCreateGoal('daily_tasks', 5)}
              >
                Add Goal
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.length > 0 ? (
              goals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {goal.goal_type.replace('_', ' ')}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {goal.current_value} / {goal.target_value}
                    </Badge>
                  </div>
                  <Progress value={getGoalProgress(goal)} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(getGoalProgress(goal))}% complete
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No active goals</p>
                <p className="text-xs text-muted-foreground">Create goals to track your progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Type Breakdown */}
      {metrics && Object.keys(metrics.tasksByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Task Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(metrics.tasksByType).map(([type, count]) => (
                <div key={type} className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground capitalize">{type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Task Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Task #{item.task_id.slice(-8)}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.completion_date && new Date(item.completion_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {item.estimated_hours && (
                    <span className="text-muted-foreground">
                      Est: {item.estimated_hours}h
                    </span>
                  )}
                  {item.actual_hours && (
                    <span className="text-muted-foreground">
                      Actual: {item.actual_hours}h
                    </span>
                  )}
                  {item.efficiency_score && (
                    <Badge variant={item.efficiency_score >= 0.9 ? 'default' : 'secondary'}>
                      {formatEfficiency(item.efficiency_score)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {analytics.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No analytics data yet</p>
                <p className="text-sm">Complete tasks with time tracking to see performance insights</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};