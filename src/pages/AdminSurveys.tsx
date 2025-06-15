
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MobileHeader from '../components/MobileHeader';
import MobileContainer from '../components/MobileContainer';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  BarChart3, 
  Settings,
  Users,
  Award,
  Eye,
  Save,
  X
} from 'lucide-react';

interface Survey {
  id: string;
  title: string;
  category: string;
  description: string;
  estimatedTime: string;
  pointReward: number;
  questions: Question[];
  completionRate: number;
  totalResponses: number;
}

interface Question {
  id: string;
  type: 'single' | 'multi';
  question: string;
  answers: string[];
}

interface UserResponse {
  userId: string;
  userEmail: string;
  surveyId: string;
  responses: Record<string, string | string[]>;
  pointsEarned: number;
  completedAt: string;
}

export default function AdminSurveys() {
  const [, setLocation] = useLocation();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'responses' | 'settings'>('overview');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);

  useEffect(() => {
    fetchSurveyData();
  }, []);

  const fetchSurveyData = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockSurveys: Survey[] = [
        {
          id: 'lifestyle',
          title: 'Lifestyle & Shopping',
          category: 'Consumer Behavior',
          description: 'Questions about shopping habits and lifestyle preferences',
          estimatedTime: '3-5 min',
          pointReward: 8,
          questions: [
            {
              id: 'q1',
              type: 'single',
              question: 'How often do you currently purchase or use reusable storage containers?',
              answers: ['Daily', 'A few times a week', 'Once a week', 'A few times a month', 'Rarely or never']
            },
            {
              id: 'q2',
              type: 'multi',
              question: 'Which features are most important when choosing reusable containers?',
              answers: ['Airtight seal', 'Microwave safe', 'Dishwasher safe', 'Stackable design', 'Sustainable materials']
            }
          ],
          completionRate: 78,
          totalResponses: 245
        },
        {
          id: 'digital',
          title: 'Digital & Tech',
          category: 'Technology',
          description: 'Your digital habits and technology preferences',
          estimatedTime: '3-5 min',
          pointReward: 8,
          questions: [
            {
              id: 'q1',
              type: 'single',
              question: 'How many hours per day do you spend on social media?',
              answers: ['Less than 1 hour', '1-2 hours', '2-4 hours', '4-6 hours', 'More than 6 hours']
            }
          ],
          completionRate: 65,
          totalResponses: 189
        },
        {
          id: 'food',
          title: 'Food & Dining',
          category: 'Food & Beverage',
          description: 'Food preferences and dining experiences',
          estimatedTime: '3-5 min',
          pointReward: 8,
          questions: [
            {
              id: 'q1',
              type: 'single',
              question: 'How often do you order food delivery?',
              answers: ['Daily', 'Few times a week', 'Weekly', 'Monthly', 'Rarely']
            }
          ],
          completionRate: 82,
          totalResponses: 312
        }
      ];

      setSurveys(mockSurveys);
      if (mockSurveys.length > 0) {
        setSelectedSurvey(mockSurveys[0]);
      }
    } catch (error) {
      console.error('Error fetching survey data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = (question: Question) => {
    if (!selectedSurvey) return;

    const updatedSurvey = {
      ...selectedSurvey,
      questions: editingQuestion
        ? selectedSurvey.questions.map(q => q.id === question.id ? question : q)
        : [...selectedSurvey.questions, { ...question, id: `q${Date.now()}` }]
    };

    setSurveys(surveys.map(s => s.id === selectedSurvey.id ? updatedSurvey : s));
    setSelectedSurvey(updatedSurvey);
    setEditingQuestion(null);
    setShowNewQuestionForm(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!selectedSurvey) return;

    const updatedSurvey = {
      ...selectedSurvey,
      questions: selectedSurvey.questions.filter(q => q.id !== questionId)
    };

    setSurveys(surveys.map(s => s.id === selectedSurvey.id ? updatedSurvey : s));
    setSelectedSurvey(updatedSurvey);
  };

  const handleUpdatePointReward = (surveyId: string, newPoints: number) => {
    const updatedSurveys = surveys.map(s => 
      s.id === surveyId ? { ...s, pointReward: newPoints } : s
    );
    setSurveys(updatedSurveys);
    if (selectedSurvey?.id === surveyId) {
      setSelectedSurvey({ ...selectedSurvey, pointReward: newPoints });
    }
  };

  if (loading) {
    return (
      <MobileContainer>
        <div className="bg-white min-h-screen">
          <MobileHeader title="Survey Management" onBack={() => setLocation('/admin')} />
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader title="Survey Management" onBack={() => setLocation('/admin')} />

        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'questions', label: 'Questions', icon: FileText },
              { id: 'responses', label: 'Responses', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4">
          {/* Survey Selector */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Survey</label>
            <select
              value={selectedSurvey?.id || ''}
              onChange={(e) => setSelectedSurvey(surveys.find(s => s.id === e.target.value) || null)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {surveys.map(survey => (
                <option key={survey.id} value={survey.id}>
                  {survey.title}
                </option>
              ))}
            </select>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && selectedSurvey && (
            <div className="space-y-4">
              {/* Survey Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{selectedSurvey.completionRate}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{selectedSurvey.totalResponses}</div>
                  <div className="text-sm text-gray-600">Total Responses</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{selectedSurvey.questions.length}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">{selectedSurvey.pointReward}</div>
                  <div className="text-sm text-gray-600">Point Reward</div>
                </div>
              </div>

              {/* Survey Details */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Survey Details</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Category:</span> {selectedSurvey.category}</div>
                  <div><span className="font-medium">Description:</span> {selectedSurvey.description}</div>
                  <div><span className="font-medium">Estimated Time:</span> {selectedSurvey.estimatedTime}</div>
                </div>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && selectedSurvey && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Questions ({selectedSurvey.questions.length})</h3>
                <button
                  onClick={() => setShowNewQuestionForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Question
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {selectedSurvey.questions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            question.type === 'single' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {question.type === 'single' ? 'Single Choice' : 'Multiple Choice'}
                          </span>
                        </div>
                        <p className="text-gray-900">{question.question}</p>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => setEditingQuestion(question)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Answers:</span> {question.answers.join(', ')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Question Form Modal */}
              {(showNewQuestionForm || editingQuestion) && (
                <QuestionForm
                  question={editingQuestion}
                  onSave={handleSaveQuestion}
                  onCancel={() => {
                    setEditingQuestion(null);
                    setShowNewQuestionForm(false);
                  }}
                />
              )}
            </div>
          )}

          {/* Responses Tab */}
          {activeTab === 'responses' && selectedSurvey && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">User Responses</h3>
              <div className="bg-white rounded-lg p-4">
                <p className="text-gray-600 text-center py-8">
                  Response data would be loaded from the database here.
                  <br />
                  This would show individual user responses and analytics.
                </p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && selectedSurvey && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Point Rewards</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points per completion
                    </label>
                    <input
                      type="number"
                      value={selectedSurvey.pointReward}
                      onChange={(e) => handleUpdatePointReward(selectedSurvey.id, parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      min="1"
                      max="20"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current conversion: {selectedSurvey.pointReward} points = RM {(selectedSurvey.pointReward / 10).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Survey Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Active</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Enabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Visible to users</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Yes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}

// Question Form Component
function QuestionForm({ 
  question, 
  onSave, 
  onCancel 
}: { 
  question: Question | null; 
  onSave: (question: Question) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<Question>(
    question || {
      id: '',
      type: 'single',
      question: '',
      answers: ['']
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.question.trim() && formData.answers.filter(a => a.trim()).length >= 2) {
      onSave({
        ...formData,
        answers: formData.answers.filter(a => a.trim())
      });
    }
  };

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = value;
    setFormData({ ...formData, answers: newAnswers });
  };

  const addAnswer = () => {
    setFormData({ ...formData, answers: [...formData.answers, ''] });
  };

  const removeAnswer = (index: number) => {
    if (formData.answers.length > 2) {
      setFormData({ 
        ...formData, 
        answers: formData.answers.filter((_, i) => i !== index) 
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {question ? 'Edit Question' : 'Add New Question'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'single' | 'multi' })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="single">Single Choice</option>
              <option value="multi">Multiple Choice</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer Options
            </label>
            <div className="space-y-2">
              {formData.answers.map((answer, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => updateAnswer(index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                    placeholder={`Option ${index + 1}`}
                    required={index < 2}
                  />
                  {formData.answers.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addAnswer}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400"
              >
                + Add Option
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
