"""Test script for AI Agent - Quick verification"""

import requests
import json

# Test transcript
TRANSCRIPT = """
CSR Jane: Thank you for calling ABC Travel, this is Jane. How may I assist you today?

Customer John Smith: Yes, I need help with a reservation I made last week. This is unacceptable service!

CSR Jane: I apologize for the trouble. May I have your name and reservation number to look up your booking?

Customer: It's John Smith. My reservation number is 012345. I booked a trip to Hawaii last week and just got an email that my flight was canceled! This is ridiculous.

CSR Jane: Let me take a look at your reservation here Mr. Smith. I see that your flight from Chicago to Honolulu on March 15th was indeed canceled by the airline. I do apologize for this inconvenience.

Customer: This is unbelievable! I booked this trip months ago. How could you just cancel my flight like that? I took time off work and made so many plans. This is completely unacceptable!

CSR Jane: You're absolutely right, having a flight canceled can be very disruptive. As your travel agent, I want to do everything I can to get this fixed for you right away. It looks like the airline has rebooked you on a flight that leaves a few hours later on the same day. I know that's still an inconvenience though. Let me see what other options may be available.

Customer: This is ridiculous. I should get a full refund if you're going to cancel my flight like that. I don't want another flight, I just want my money back!

CSR Jane: I completely understand your frustration, Mr. Smith. Since this cancellation was initiated by the airline, you are entitled to a full refund if you prefer not to be rebooked. I can definitely process that refund for the flight cost right away. How about the hotel and other portions of your trip - would you like for me to look into refunds or changes for those as well?

Customer: This is unacceptable. I spent so much money on this trip and now it's ruined. I want a full refund for everything - the flight, the hotel, the car rental. You need to fix this!

CSR Jane: You're absolutely right, Mr. Smith. Let me process full refunds for your entire trip booking right now. I see you booked 2 roundtrip flights, 5 nights hotel in Honolulu, and a 7 day car rental. I will get all of those refunded in full immediately. You should see the refund hit your credit card in 3-5 business days.

Customer: How could you let this happen? I booked my trip so far in advance specifically to avoid problems! Now everything is ruined and I had to waste my time calling you to get this fixed. This is the worst service ever.

CSR Jane: Mr. Smith, I fully understand why you are upset about having your trip canceled. As a valued customer, you should be able to trust that your travel plans will go smoothly when you book with us. This situation absolutely falls short of our service standards. To make things right, I would like to offer you a $200 travel voucher that can be used on a future trip as an apology for this major inconvenience. Would that help restore your confidence in our company?

Customer: I don't want a voucher, I just want you to do your job! This is unbelievable. I need to speak to a supervisor immediately.

CSR Jane: I certainly understand you wishing to speak to a supervisor to express your frustrations about this situation. Please hold for just one moment while I transfer you. Again, I sincerely apologize that we failed to meet expectations on this booking.

Supervisor Sarah: Hello Mr. Smith, this is Sarah the supervisor. I understand you've had trouble with your recent booking to Hawaii. I want to sincerely apologize for the cancellation - I know how disruptive that must be. Jane briefed me on the situation and I see she processed full refunds for your trip. I completely understand your frustration. At ABC Travel, it is our top priority to deliver seamless travel experiences to our valued customers like yourself. We clearly dropped the ball and I take full responsibility for that. What else can I do to help restore your confidence in us moving forward?

Customer: This has been a terrible experience. You should train your staff better so these problems don't happen. I expect much better service than this if I'm going to book through your company again.

Supervisor Sarah: You're absolutely right, Mr. Smith. The cancellation of your trip should not have happened. This is clearly an area where we need to improve our service and internal procedures. I will work with our team to assess what went wrong and implement better training around managing cancellations and rebookings. We value you as our customer and want to learn from this experience.
"""

def test_agent():
    """Test the AI Agent API"""
    print("🤖 Testing AI Agent API...")
    print("=" * 60)
    
    url = "http://localhost:8000/api/agent/analyze"
    payload = {
        "transcript": TRANSCRIPT,
        "context": "customer_service"
    }
    
    try:
        print("\n📤 Sending transcript to AI Agent...")
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        print("\n✅ SUCCESS! AI Agent Analysis Complete\n")
        print("=" * 60)
        
        # Display results
        print(f"\n📊 EXECUTIVE SUMMARY:")
        print(f"   {data['summary']}\n")
        
        print(f"⚠️  RISK LEVEL: {data['risk_level'].upper()}")
        print(f"📈 CHURN PROBABILITY: {data['churn_probability']:.0f}%\n")
        
        print(f"😠 SENTIMENT TIMELINE:")
        for point in data['sentiment_timeline']:
            print(f"   {point['emoji']} {point['stage']}: {point['sentiment']}")
        
        print(f"\n💡 KEY INSIGHTS ({len(data['insights'])} found):")
        for insight in data['insights']:
            print(f"\n   {insight['title']}")
            print(f"   Priority: {insight['priority'].upper()}")
            print(f"   Category: {insight['category']}")
            for action in insight['suggested_actions'][:2]:
                print(f"   • {action}")
        
        print(f"\n✅ TASKS TO CREATE ({len(data['tasks_to_create'])} tasks):")
        for task in data['tasks_to_create']:
            print(f"\n   [{task['priority'].upper()}] {task['title']}")
            print(f"   Due: {task['due_date']}")
            print(f"   Assign: {task['assigned_to']}")
        
        print(f"\n👤 CONTACTS IDENTIFIED ({len(data['contacts_identified'])} people):")
        for contact in data['contacts_identified']:
            print(f"   • {contact['name']} ({contact['role']})")
        
        print(f"\n🎯 RECOMMENDED ACTIONS:")
        for i, action in enumerate(data['recommended_actions'][:5], 1):
            print(f"   {i}. {action}")
        
        print("\n" + "=" * 60)
        print("🎉 AI Agent is working perfectly!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to API")
        print("   Make sure the backend is running:")
        print("   cd backend && uvicorn app.main:app --reload")
    except requests.exceptions.HTTPError as e:
        print(f"\n❌ API Error: {e}")
        print(f"   Response: {response.text}")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_agent()


