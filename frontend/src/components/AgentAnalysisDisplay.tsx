import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { 
  Brain, TrendingUp, AlertTriangle, CheckCircle2, 
  Users, Target, Clock, Sparkles, ArrowRight,
  Zap, Shield, Activity, MessageSquare, FileText,
  Calendar, ListChecks, Bell, DollarSign
} from 'lucide-react'

interface AgentInsight {
  category: string
  priority: string
  title: string
  description: string
  action_required: boolean
  suggested_actions: string[]
}

interface AgentAnalysisProps {
  analysis: {
    summary: string
    key_points: string[]
    sentiment_timeline: Array<{
      stage: string
      sentiment: string
      emoji: string
      description: string
    }>
    risk_level: string
    churn_probability: number
    insights: AgentInsight[]
    recommended_actions: string[]
    contacts_identified: Array<{
      name: string
      email: string
      phone: string
      role: string
      company: string
    }>
    deals_identified: Array<{
      title: string
      value: number
      stage: string
      status: string
      notes: string
    }>
    tasks_to_create: Array<{
      title: string
      description: string
      priority: string
      due_date: string
      assigned_to: string
    }>
    // MOM fields
    meeting_title?: string
    meeting_date?: string
    attendees?: string[]
    decisions_made?: string[]
    action_items?: Array<{
      action: string
      owner: string
      due_date: string
      priority: string
      status: string
    }>
    follow_up_items?: string[]
    next_meeting?: string
  }
}

const getRiskColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'critical': return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
    case 'high': return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-200'
    case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200'
    default: return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'urgent': return 'bg-red-500 text-white'
    case 'high': return 'bg-orange-500 text-white'
    case 'medium': return 'bg-yellow-500 text-white'
    default: return 'bg-blue-500 text-white'
  }
}

const getChurnColor = (probability: number) => {
  if (probability >= 70) return 'text-red-600 dark:text-red-400'
  if (probability >= 50) return 'text-orange-600 dark:text-orange-400'
  if (probability >= 30) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-green-600 dark:text-green-400'
}

export function AgentAnalysisDisplay({ analysis }: AgentAnalysisProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header with AI Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              AI Agent Analysis
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Comprehensive intelligence report generated in 2 seconds
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold shadow-lg">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered</span>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {analysis.risk_level === 'critical' && (
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-xl shadow-2xl border-2 border-red-300 dark:border-red-700 animate-pulse">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">🚨 CRITICAL ALERT: Immediate Action Required</h3>
              <p className="text-white/90 text-lg">
                High-priority customer issue detected with {analysis.churn_probability.toFixed(0)}% churn probability. 
                This customer needs immediate attention to prevent loss.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Level */}
        <Card className={`border-2 ${getRiskColor(analysis.risk_level)} transform hover:scale-105 transition-all duration-300`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Risk Level</p>
                <p className="text-3xl font-bold mt-1">{analysis.risk_level.toUpperCase()}</p>
              </div>
              <Shield className="w-12 h-12 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Churn Probability */}
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 transform hover:scale-105 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Churn Probability</p>
                <p className={`text-3xl font-bold mt-1 ${getChurnColor(analysis.churn_probability)}`}>
                  {analysis.churn_probability.toFixed(0)}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        {/* Insights Generated */}
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 transform hover:scale-105 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Insights Found</p>
                <p className="text-3xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                  {analysis.insights.length}
                </p>
              </div>
              <Zap className="w-12 h-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary */}
      <Card className="border-l-4 border-purple-500 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <CardTitle>Executive Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {analysis.summary}
          </p>
        </CardContent>
      </Card>

      {/* Sentiment Timeline */}
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>Sentiment Journey</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400"></div>
            
            <div className="space-y-6">
              {analysis.sentiment_timeline.map((point, idx) => (
                <div key={idx} className="relative flex items-start space-x-4 pl-4">
                  {/* Timeline Dot */}
                  <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                    {point.emoji}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {point.stage}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          point.sentiment === 'negative' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                          point.sentiment === 'positive' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          point.sentiment === 'empathetic' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {point.sentiment}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout: Insights & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Insights */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <CardTitle>Critical Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {analysis.insights.map((insight, idx) => (
                <div 
                  key={idx}
                  className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-r-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{insight.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(insight.priority)}`}>
                      {insight.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{insight.description}</p>
                  <div className="space-y-1">
                    {insight.suggested_actions.slice(0, 3).map((action, actionIdx) => (
                      <div key={actionIdx} className="flex items-center space-x-2 text-xs text-gray-700 dark:text-gray-300">
                        <ArrowRight className="w-3 h-3 text-orange-500" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Auto-Generated Tasks */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <CardTitle>Auto-Generated Tasks</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {analysis.tasks_to_create.map((task, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-lg border-2 hover:shadow-lg transition-all ${
                    task.priority === 'urgent' 
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
                      : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{task.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Due: {task.due_date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{task.assigned_to}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Actions */}
      <Card className="shadow-xl border-2 border-purple-200 dark:border-purple-800">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <CardTitle>Recommended Next Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.recommended_actions.map((action, idx) => (
              <div 
                key={idx}
                className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contacts & Deals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contacts */}
        {analysis.contacts_identified.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <CardTitle>Contacts Identified</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.contacts_identified.map((contact, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{contact.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{contact.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deals */}
        {analysis.deals_identified.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                <CardTitle>Deals Detected</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.deals_identified.map((deal, idx) => (
                  <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{deal.title}</h4>
                      {deal.value > 0 && (
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${deal.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded">
                        {deal.stage}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                        {deal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Minutes of Meeting (MOM) Section */}
      {(analysis.meeting_title || analysis.action_items?.length || analysis.decisions_made?.length) && (
        <Card className="shadow-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <CardTitle className="text-2xl">Minutes of Meeting (MOM)</CardTitle>
              </div>
              {analysis.meeting_date && (
                <div className="flex items-center space-x-2 text-sm text-indigo-700 dark:text-indigo-300">
                  <Calendar className="w-4 h-4" />
                  <span>{analysis.meeting_date}</span>
                </div>
              )}
            </div>
            {analysis.meeting_title && (
              <p className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mt-2">
                {analysis.meeting_title}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Attendees */}
            {analysis.attendees && analysis.attendees.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="flex items-center mb-3">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">Attendees ({analysis.attendees.length})</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.attendees.map((attendee, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium"
                    >
                      <Users className="w-3 h-3 mr-1" />
                      {attendee}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Decisions */}
            {analysis.decisions_made && analysis.decisions_made.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="flex items-center mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">Key Decisions Made</h4>
                </div>
                <ul className="space-y-2">
                  {analysis.decisions_made.map((decision, idx) => (
                    <li 
                      key={idx}
                      className="flex items-start space-x-2 text-gray-700 dark:text-gray-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{decision}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items with Owners */}
            {analysis.action_items && analysis.action_items.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="flex items-center mb-3">
                  <ListChecks className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">Action Items ({analysis.action_items.length})</h4>
                </div>
                <div className="space-y-3">
                  {analysis.action_items.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-start space-x-2">
                          <input 
                            type="checkbox"
                            checked={item.status === 'completed'}
                            className="mt-1"
                            readOnly
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.action}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {item.owner}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {item.due_date}
                              </span>
                              <span className={`px-2 py-0.5 rounded ${getPriorityColor(item.priority)}`}>
                                {item.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Items */}
            {analysis.follow_up_items && analysis.follow_up_items.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="flex items-center mb-3">
                  <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">Follow-up Required</h4>
                </div>
                <ul className="space-y-2">
                  {analysis.follow_up_items.map((item, idx) => (
                    <li 
                      key={idx}
                      className="flex items-start space-x-2 text-gray-700 dark:text-gray-300"
                    >
                      <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Meeting */}
            {analysis.next_meeting && (
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-700">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-bold text-purple-900 dark:text-purple-100">Next Meeting</h4>
                </div>
                <p className="text-purple-800 dark:text-purple-200 mt-2 font-medium">
                  {analysis.next_meeting}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

