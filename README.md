# 🌐 AI Translation Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)](https://flask.palletsprojects.com/)
[![IBM Watson](https://img.shields.io/badge/IBM-Watson-blue.svg)](https://www.ibm.com/watson)

An intelligent, context-aware translation system that revolutionizes language translation by moving beyond traditional word-to-word mapping to provide accurate, contextual translations using advanced AI models.

## 🚀 Live Demo

**[Try the App](https://huggingface.co/spaces/YOUR_USERNAME/ai-translation-assistant)** | **[Portfolio](https://yourportfolio.com)**

## ✨ Features

### 🎯 **Smart Translation**

- **Context-Aware Processing**: Uses IBM WatsonX LLM for understanding context and nuance
- **Beyond Word Mapping**: Eliminates traditional translation limitations through AI comprehension
- **Cultural Sensitivity**: Adapts translations based on cultural context and idiomatic expressions

### 🎤 **Voice-to-Voice Translation**

- **Real-time Speech Recognition**: IBM Watson Speech-to-Text with noise cancellation
- **Natural Voice Synthesis**: IBM Watson Text-to-Speech with multiple voice options
- **Seamless Audio Flow**: Speak → Translate → Listen workflow

### 🌍 **Multi-Language Support**

- English (US), Spanish (Spain), French (France), German (Germany)
- Japanese (Japan), Chinese (Mandarin), Portuguese (Brazil), Italian (Italy)
- Bidirectional translation capabilities

### 🎨 **Modern Interface**

- **Minimalist Design**: Clean, distraction-free interface
- **Dark/Light Mode**: Adaptive theming for user preference
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Accessibility First**: Keyboard navigation and screen reader support

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Flask Server   │    │  IBM Watson     │
│  (HTML/CSS/JS)  │◄──►│   (Python)       │◄──►│   Services      │
│                 │    │                  │    │                 │
│ • Voice Input   │    │ • Route Handling │    │ • Speech-to-Text│
│ • UI Controls   │    │ • API Integration│    │ • WatsonX LLM   │
│ • Audio Output  │    │ • Data Processing│    │ • Text-to-Speech│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack


| Component              | Technology                       | Purpose                         |
| ---------------------- | -------------------------------- | ------------------------------- |
| **Frontend**           | HTML5, CSS3, JavaScript (ES6+)   | User interface and interaction  |
| **Backend**            | Python Flask, Flask-CORS         | API server and request handling |
| **Speech Recognition** | IBM Watson Speech-to-Text        | Convert speech to text          |
| **Translation Engine** | IBM WatsonX Foundation Models    | Context-aware translation       |
| **Speech Synthesis**   | IBM Watson Text-to-Speech        | Convert text to natural speech  |
| **Styling**            | CSS Grid, Flexbox, CSS Variables | Responsive, modern design       |

## 📦 Installation

### Prerequisites

- Python 3.8+
- IBM Cloud Account with Watson services
- Git

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-translation-assistant.git
   cd ai-translation-assistant
   ```
2. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```
4. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your IBM Watson credentials
   ```
5. **Run the application**

   ```bash
   python -m translator.server
   ```
6. **Open your browser**

   ```
   http://localhost:8000
   ```

## ⚙️ Configuration

Create a `.env` file with your IBM Watson credentials:

```env
# IBM Watson Machine Learning
API_KEY=your_watsonx_api_key
PROJECT_ID=your_project_id

# IBM Watson Speech-to-Text
STT_API_KEY=your_stt_api_key
STT_BASE_URL=https://api.au-syd.speech-to-text.watson.cloud.ibm.com

# IBM Watson Text-to-Speech
TTS_API_KEY=your_tts_api_key
TTS_BASE_URL=https://api.au-syd.text-to-speech.watson.cloud.ibm.com
```

### Local Development

```bash
# Development mode with auto-reload
export FLASK_ENV=development
python -m translator.server
```

## 📊 Performance


| Metric                          | Performance                             |
| ------------------------------- | --------------------------------------- |
| **Speech Recognition Accuracy** | 95%+ (optimized for multiple languages) |
| **Translation Quality**         | High contextual accuracy with WatsonX   |
| **Response Time**               | < 3 seconds end-to-end                  |
| **Supported Languages**         | 8 major languages                       |
| **Audio Quality**               | 16kHz, mono, noise-cancelled            |

## 🔧 API Endpoints


| Endpoint           | Method | Description             |
| ------------------ | ------ | ----------------------- |
| `/`                | GET    | Serve main application  |
| `/speech-to-text`  | POST   | Convert audio to text   |
| `/process-message` | POST   | Translate text using AI |
| `/languages`       | GET    | Get supported languages |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **IBM Watson** for providing powerful AI services
- **Flask** for the lightweight web framework
- **MDN Web Docs** for audio API documentation
- **Font Awesome** for beautiful icons

## 📞 Contact

**Your Name** - [@yourtwitter](https://twitter.com/QaziWaiz) - waizqazi2@gmail.com

**Project Link**: [https://github.com/YOUR_USERNAM/ai-translation-assistant](https://github.com/waize333/ai-translation-assistant)

---

<div align="center">
  <strong>Built with ❤️ using IBM Watson AI Services</strong>
</div>
