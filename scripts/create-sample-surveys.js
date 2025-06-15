
const { MongoClient } = require('mongodb');

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb+srv://kosemani:omowunmi888@cluster0.4i82g.mongodb.net/learn?retryWrites=true';

const sampleSurveys = [
  {
    id: 'lifestyle_shopping',
    title: 'Lifestyle & Shopping Habits',
    category: 'Consumer Behavior',
    description: 'Help us understand your shopping preferences and lifestyle choices',
    estimatedTime: '4-6 min',
    basePoints: 12,
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: 'How often do you shop online?',
        answers: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never']
      },
      {
        id: 'q2',
        type: 'multi',
        question: 'Which factors influence your purchasing decisions?',
        answers: ['Price', 'Quality', 'Brand reputation', 'Reviews', 'Sustainability']
      },
      {
        id: 'q3',
        type: 'single',
        question: 'What is your preferred payment method?',
        answers: ['Credit card', 'Debit card', 'Digital wallet', 'Cash', 'Bank transfer']
      },
      {
        id: 'q4',
        type: 'multi',
        question: 'Which shopping categories interest you most?',
        answers: ['Fashion', 'Electronics', 'Home & Garden', 'Health & Beauty', 'Food & Beverage']
      }
    ],
    schedule: { 
      type: 'weekly', 
      frequency: 1, 
      nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
    },
    targeting: { 
      userBehavior: ['new_user'], 
      completedCategories: [], 
      pointsRange: { min: 0, max: 100 } 
    },
    isActive: true,
    multiplier: 1
  },
  {
    id: 'daily_mood_checkin',
    title: 'Daily Mood Check-in',
    category: 'Wellness',
    description: 'Quick daily check-in about your mood and energy levels',
    estimatedTime: '1-2 min',
    basePoints: 5,
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: 'How would you rate your mood today?',
        answers: ['Excellent', 'Good', 'Neutral', 'Poor', 'Very poor']
      },
      {
        id: 'q2',
        type: 'single',
        question: 'What is your energy level today?',
        answers: ['Very high', 'High', 'Moderate', 'Low', 'Very low']
      },
      {
        id: 'q3',
        type: 'multi',
        question: 'What activities did you do today?',
        answers: ['Exercise', 'Work', 'Socializing', 'Hobbies', 'Rest']
      }
    ],
    schedule: { 
      type: 'daily', 
      frequency: 1, 
      nextAvailable: new Date() 
    },
    targeting: { 
      userBehavior: ['active_user'], 
      completedCategories: [], 
      pointsRange: { min: 0, max: 1000 } 
    },
    isActive: true,
    multiplier: 1.5
  },
  {
    id: 'tech_preferences',
    title: 'Technology & Digital Habits',
    category: 'Technology',
    description: 'Share your technology usage patterns and preferences',
    estimatedTime: '5-7 min',
    basePoints: 15,
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: 'Which operating system do you primarily use?',
        answers: ['Windows', 'macOS', 'Linux', 'ChromeOS', 'Other']
      },
      {
        id: 'q2',
        type: 'multi',
        question: 'Which social media platforms do you use regularly?',
        answers: ['Facebook', 'Instagram', 'Twitter/X', 'TikTok', 'LinkedIn', 'YouTube']
      },
      {
        id: 'q3',
        type: 'single',
        question: 'How many hours per day do you spend on your smartphone?',
        answers: ['Less than 1 hour', '1-3 hours', '3-5 hours', '5-8 hours', 'More than 8 hours']
      },
      {
        id: 'q4',
        type: 'single',
        question: 'What is your biggest concern about technology?',
        answers: ['Privacy', 'Security', 'Addiction', 'Cost', 'Complexity']
      }
    ],
    schedule: { 
      type: 'monthly', 
      frequency: 1, 
      nextAvailable: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
    },
    targeting: { 
      userBehavior: ['active_user'], 
      completedCategories: ['lifestyle'], 
      pointsRange: { min: 50, max: 500 } 
    },
    isActive: true,
    multiplier: 1
  },
  {
    id: 'food_dining',
    title: 'Food & Dining Preferences',
    category: 'Food & Beverage',
    description: 'Tell us about your food preferences and dining habits',
    estimatedTime: '3-5 min',
    basePoints: 10,
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: 'How often do you cook at home?',
        answers: ['Daily', 'Several times a week', 'Weekly', 'Rarely', 'Never']
      },
      {
        id: 'q2',
        type: 'multi',
        question: 'What types of cuisine do you enjoy?',
        answers: ['Asian', 'Italian', 'Mexican', 'Mediterranean', 'American', 'Indian']
      },
      {
        id: 'q3',
        type: 'single',
        question: 'Do you follow any specific diet?',
        answers: ['No specific diet', 'Vegetarian', 'Vegan', 'Keto', 'Mediterranean', 'Other']
      },
      {
        id: 'q4',
        type: 'multi',
        question: 'What factors are most important when choosing food?',
        answers: ['Taste', 'Health', 'Price', 'Convenience', 'Sustainability']
      }
    ],
    schedule: { 
      type: 'weekly', 
      frequency: 2, 
      nextAvailable: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) 
    },
    targeting: { 
      userBehavior: ['new_user', 'active_user'], 
      completedCategories: [], 
      pointsRange: { min: 0, max: 200 } 
    },
    isActive: true,
    multiplier: 1
  },
  {
    id: 'weekend_special',
    title: 'Weekend Activities Survey',
    category: 'Lifestyle',
    description: 'Weekend bonus survey about your leisure activities',
    estimatedTime: '2-3 min',
    basePoints: 8,
    questions: [
      {
        id: 'q1',
        type: 'multi',
        question: 'What do you typically do on weekends?',
        answers: ['Sleep in', 'Exercise', 'Socialize', 'Work', 'Hobbies', 'Travel']
      },
      {
        id: 'q2',
        type: 'single',
        question: 'How do you prefer to spend your free time?',
        answers: ['Indoors', 'Outdoors', 'Mix of both', 'Depends on weather', 'Depends on mood']
      },
      {
        id: 'q3',
        type: 'single',
        question: 'What time do you usually wake up on weekends?',
        answers: ['Before 7 AM', '7-9 AM', '9-11 AM', '11 AM-1 PM', 'After 1 PM']
      }
    ],
    schedule: { 
      type: 'weekly', 
      frequency: 1, 
      nextAvailable: new Date() 
    },
    targeting: { 
      userBehavior: ['active_user', 'high_earner'], 
      completedCategories: ['lifestyle'], 
      pointsRange: { min: 30, max: 1000 } 
    },
    isActive: true,
    multiplier: 2
  },
  {
    id: 'health_wellness',
    title: 'Health & Wellness Check',
    category: 'Health',
    description: 'Share your health and wellness habits with us',
    estimatedTime: '4-6 min',
    basePoints: 12,
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: 'How many times per week do you exercise?',
        answers: ['0 times', '1-2 times', '3-4 times', '5-6 times', 'Daily']
      },
      {
        id: 'q2',
        type: 'multi',
        question: 'What types of exercise do you prefer?',
        answers: ['Running', 'Weight training', 'Yoga', 'Swimming', 'Team sports', 'Walking']
      },
      {
        id: 'q3',
        type: 'single',
        question: 'How many hours of sleep do you get per night?',
        answers: ['Less than 5', '5-6 hours', '6-7 hours', '7-8 hours', 'More than 8']
      },
      {
        id: 'q4',
        type: 'single',
        question: 'How would you rate your overall health?',
        answers: ['Excellent', 'Very good', 'Good', 'Fair', 'Poor']
      }
    ],
    schedule: { 
      type: 'monthly', 
      frequency: 1, 
      nextAvailable: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) 
    },
    targeting: { 
      userBehavior: ['active_user'], 
      completedCategories: [], 
      pointsRange: { min: 20, max: 300 } 
    },
    isActive: true,
    multiplier: 1
  }
];

async function createSampleSurveys() {
  let client;
  
  try {
    client = new MongoClient(DATABASE_URL);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('learn');
    const surveysCollection = db.collection('surveys');
    
    // Clear existing surveys (optional)
    await surveysCollection.deleteMany({});
    console.log('Cleared existing surveys');
    
    // Insert sample surveys
    const result = await surveysCollection.insertMany(sampleSurveys);
    console.log(`Successfully inserted ${result.insertedCount} surveys`);
    
    // Log survey details
    console.log('\nCreated surveys:');
    sampleSurveys.forEach(survey => {
      console.log(`- ${survey.title} (${survey.category}) - ${survey.basePoints} points`);
    });
    
  } catch (error) {
    console.error('Error creating sample surveys:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

createSampleSurveys();
