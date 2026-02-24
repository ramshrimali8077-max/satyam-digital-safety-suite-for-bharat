# SATYAM – Digital Safety Suite for Bharat
## AI for Bharat Hackathon Submission

## 1. Problem Overview

In rural and semi-urban India (Deep Bharat), misinformation and digital fraud spread rapidly through WhatsApp forwards, voice messages, and scam calls. Due to low digital literacy, language barriers, and lack of accessible verification tools, citizens often fall victim to:

- Fake health and government scheme rumors
- OTP and banking fraud calls
- Financial scams and phishing attempts
- Panic and communal misinformation

Existing solutions are English-centric and not designed for low-resource users.

SATYAM aims to provide an accessible AI-powered safety tool for Indian citizens.

---

## 2. Target Users

- Rural & semi-urban citizens
- Farmers & daily wage workers
- Senior citizens
- First-time smartphone users
- People relying on WhatsApp for information

---

## 3. Goals & Objectives

SATYAM aims to:

- Prevent misinformation spread
- Protect users from fraud calls & scams
- Provide simple verification in local languages
- Enable citizens to report digital fraud
- Build digital trust in Bharat

---

## 4. Functional Requirements

### 4.1 Fake News Detection
The system shall:
- Accept text, image, and voice inputs
- Extract text using OCR
- Convert speech to text
- Detect misinformation using AI models
- Verify claims using trusted Indian sources
- Provide verdict: Fake / Real / Suspicious
- Provide simple explanation in local language
- Provide “Do Not Forward” warning

---

### 4.2 Screen Scanner (Cross-App)
The system shall:
- Capture current screen content
- Extract visible text
- Verify information instantly
- Display overlay result popup

---

### 4.3 Clipboard Monitoring
The system shall:
- Detect copied text
- Suggest verification via notification
- Perform background analysis

---

### 4.4 Floating Quick-Access Bubble
The system shall:
- Provide always-accessible floating bubble
- Allow instant scan and chatbot access

---

### 4.5 AI Chatbot Assistant
The system shall:
- Allow users to ask verification questions
- Provide proof-based answers
- Use trusted sources only
- Support Hindi and Tamil

---

### 4.6 Fraud Call Detection
The system shall:
- Detect suspicious incoming calls
- Check numbers against scam databases
- Detect scam phrases (OTP, KYC, urgent threats)
- Display real-time fraud alerts
- Provide risk score

---

### 4.7 Government Reporting Integration
The system shall:
- Generate structured fraud reports
- Allow one-tap call to cybercrime helpline (1930)
- Open cybercrime reporting portal
- Require user confirmation before submission

---

## 5. Non-Functional Requirements

### Performance
- Real-time verification (< 5 seconds)
- Low battery consumption

### Privacy & Security
- On-device processing for sensitive data
- User consent for permissions
- No storage of call audio
- Compliance with Indian IT Act

### Usability
- Voice-first interaction
- Large icons & simple UI
- Hindi-first interface

### Reliability
- Offline mode with periodic sync
- Cached verification data

### Scalability
- Modular architecture
- Support for additional Indian languages

---

## 6. Constraints & Assumptions

- Android-first deployment
- Limited bandwidth environments
- Requires user permission for accessibility features
- Cloud connectivity may be intermittent

---

## 7. Success Criteria

The solution will be considered successful if it:

- Accurately detects misinformation and fraud
- Reduces user exposure to scams
- Provides easy-to-understand explanations
- Operates effectively in low-connectivity areas
- Demonstrates scalability across India

---

## 8. Future Enhancements

- Multilingual expansion
- WhatsApp bot integration
- Community misinformation heatmap
- AI rumor trend detection
- Government partnerships
