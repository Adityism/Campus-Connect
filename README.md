🌐 Campus Connect

🚀 Campus Connect is an AI-powered web platform designed to streamline campus communication, faculty interaction, and student engagement. 

✨ Features

🔹 ProfConnect (Faculty Directory)
	•	View professor details, including office location, email, and availability.
	•	Smart search functionality with AI-powered recommendations.
	•	Schedule meetings or raise queries directly.

🔹 AI-Powered Chatbot
	•	Get instant answers to campus-related queries using an LLaMA-3-based chatbot.
	•	Trained on university data to provide relevant and contextual responses.

🔹 Announcements & Notifications
	•	Stay updated with important university announcements.
	•	Push notifications for new events, faculty notices, and deadlines.

🔹 UniFirst 
	•	Real-time messaging using Flask & Socket.IO.
	•	Connect instantly with peers, professors, and student groups.

🔹 Secure Authentication
	•	Microsoft OAuth & Firebase Authentication for secure login.
	•	Option for direct sign-up without Microsoft login.

🔹 Modern UI & UX
	•	Clean, responsive UI with an engaging user experience.
	•	Dynamic dashboard with role-based access.


🚀 Installation

1️⃣ Clone the Repository

git clone https://github.com/Adityism/Campus-Connect.git
cd Campus-Connect

2️⃣ Set Up Virtual Environment (Backend)

python3 -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate  # Windows

3️⃣ Install Dependencies

pip install -r requirements.txt
cd frontend
npm install

4️⃣ Set Up Environment Variables

Create a .env file in the root directory and add:

SECRET_KEY=your_secret_key
DATABASE_URL=mysql://username:password@localhost/db_name


5️⃣ Run the Application

cd backend
flask run  # Backend server

cd frontend
npm start  # Frontend React app

📌 Contribution

Want to contribute? 🚀
	1.	Fork the repo
	2.	Create a feature branch (git checkout -b feature-branch)
	3.	Commit changes (git commit -m "Added new feature")
	4.	Push to your branch (git push origin feature-branch)
	5.	Open a Pull Request 🎉




💡 Future Enhancements
	•	🎓 AI-driven Student Advisor for academic and career guidance.
	•	🔗 Integration with university portals for fee payments & course selection.
	•	📅 Personalized student dashboard with timetables and assignments.

📞 Contact

For queries, reach out to:
📩 Aditya Goyal – GitHub | https://www.linkedin.com/in/aditya-goyal-007a91237/

🔥 Campus Connect – Connecting Minds Across Campus! 🔥
