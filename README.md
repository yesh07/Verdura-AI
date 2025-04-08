# Verdura AI – Eat Well. Live Fresh. Powered by AI.

## Inspiration

Verdura AI was inspired by the desire to create a bridge between local, seasonal food availability and personalized wellness recommendations. While nutrition apps often focus on tracking macros or counting calories, they rarely integrate with real-world data like farmers markets, seasonal produce, or community-based food systems. This project reimagines food technology through the lens of **location, seasonality, and AI**, helping users align their eating habits with both their wellness goals and what’s fresh locally.

## What it does

Verdura AI is an AI-powered farm-to-wellness platform that allows users to:

- Search for local produce by ZIP code and discover what’s fresh near them
- Ask AI-driven wellness questions such as “What should I eat for better sleep?”
- Generate smart seasonal food bundles based on available produce and wellness goals
- Receive a personalized 7-day meal plan using seasonal ingredients
- View a demo marketplace of local farmers and vendors with product listings
- Analyze nutrition from either typed ingredients or food images using AI

It combines data science, AI, and intuitive UI to deliver a complete food and wellness experience.

## How we built it

The project is composed of a **Next.js frontend** and a **FastAPI backend**, connected through REST endpoints and powered by Google’s Gemini AI models.

### Frontend:
- **Next.js 15.2.4** with **React 19** (App Router)
- **TypeScript** for static type safety
- **TailwindCSS** for styling
- **Radix UI** and **ShadCN** for accessible UI components
- **Framer Motion** for animations and transitions
- **ESLint** and **Prettier** for code quality
- **Utility libraries**: `clsx`, `lodash`, etc.

### Backend:
- **FastAPI** (Python 3.12) for REST API routes
- **Uvicorn** as the ASGI server
- **Google Generative AI (Gemini 1.5 Pro & Flash)** for AI-powered endpoints
- **Pydantic** for request validation and typing
- **Pandas** for data transformation and CSV parsing
- **Pillow (PIL)** for image processing (Vision AI input)
- **Python-dotenv** for secure environment management

### Architecture:
- TypeScript-based frontend using Next.js with modular routing
- Python backend exposing LLM and vision-powered endpoints
- JSON-based API communication between client and server
- Local USDA dataset integration (CSV) for produce/farmers data
- Designed for deployment via **Vercel (frontend)** and optionally **Render/Railway** for backend

## Challenges we ran into

- **Real-time API limitations**: USDA APIs lacked reliable or free real-time access. As a workaround, we sourced and cleaned static datasets from [USDA.gov](https://www.usda.gov/) and built a parser to convert it into usable frontend JSON.
- **Data inconsistencies**: Farmers market data varied in structure and completeness, requiring extensive data cleaning and schema mapping.
- **Prompt engineering**: Formatting prompts for Gemini to generate structured, goal-relevant outputs required careful tuning and error handling.
- **Cross-stack debugging**: Maintaining API contract consistency across TypeScript (frontend) and Python (backend) required close coordination.

## Accomplishments that we're proud of

- Built a working, AI-powered health assistant with real produce data in under 24 hours
- Integrated both **text and image-based macro estimators** using Google’s Gemini APIs
- Created a **modular and extensible app architecture** with seamless frontend/backend communication
- Developed a clean, mobile-responsive UI with animated transitions and real-time UX
- Leveraged public datasets to build a socially conscious and practical AI application

## What we learned

- How to build full-stack applications with modern web tools (Next.js + FastAPI)
- Advanced prompt design for health-related reasoning using generative models
- Strategies for transforming raw open data (CSV) into usable digital content
- Image processing and Vision AI input handling with Gemini
- The importance of building developer-friendly tooling (ESLint, TypeScript, modular design) for velocity and reliability

## What's next for Verdura AI

- Connect to the **live USDA Farmers Market API** for real-time produce and event data
- Enable **user authentication** and saving of bundles, wellness goals, and plans
- Add **user-specific dashboards** for tracking nutrition and seasonal eating
- Allow **farmers to register and manage their storefronts** directly on the platform
- Integrate **macro and calorie tracking history** using Firebase or another cloud backend
- Finalize deployment for public access and expand beyond Chicago to nationwide coverage

## Built With

### Languages & Frameworks
- **TypeScript** / **React 19**
- **Next.js 15.2.4**
- **TailwindCSS**, **ShadCN**, **Radix UI**
- **Framer Motion** (animations)
- **FastAPI** / **Python 3.12**
- **Pandas**, **Pillow**, **Pydantic**

### AI & APIs
- **Google Gemini 1.5 Pro (LLM)** – wellness chatbot, bundles, macro text estimator
- **Gemini 1.5 Flash (Vision)** – food image analysis for nutrition estimation
- **USDA.gov** – Chicago farmers market CSV dataset
- **DiceBear API** – avatar generation for farmer profiles

### Dev & Tools
- **Uvicorn** – ASGI server
- **dotenv** – Environment variable loading
- **ESLint**, **Prettier** – Code formatting and linting
- **Cursor IDE** – AI-powered development environment
- **Postman / HTTP clients** – API testing

---

*Verdura AI was designed, engineered, and deployed by a solo developer in under 24 hours for a WildHacks 2025 hackathon challenge, with a vision to make food intelligence accessible, seasonal, and local.*

<img width="1466" alt="Screenshot 2025-04-06 at 6 51 01 AM" src="https://github.com/user-attachments/assets/0af34caf-7977-4eb1-a898-93972315dcf3" />

