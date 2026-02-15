# SATYAM – Digital Safety Suite for Bharat
## System Design Document

## 1. System Overview

SATYAM is an Android-first AI-powered safety application designed to detect misinformation and digital fraud. The system combines on-device AI processing with cloud verification to ensure privacy, speed, and scalability.

The architecture is modular and event-driven, enabling real-time protection and nationwide scalability.

---

## 2. High-Level Architecture

### System Flow

User Interaction  
↓  
Input Processing (OCR / Speech-to-Text / Clipboard Monitoring)  
↓  
NLP Embedding (IndicBERT)  
↓  
Fake Pattern Classifier (LSTM + SVM)  
↓  
Claim Extraction & Verification Engine  
↓  
Decision & Risk Scoring Engine  
↓  
Explanation Generator  
↓  
UI Overlay + Voice Output  

Fraud detection runs in parallel background services.

Cloud backend supports verification, analytics, and updates.

---

## 3. Component Architecture

### 3.1 User Interface Layer
- Floating bubble overlay
- Voice-first interface
- Risk meter visualization
- Hindi-first UX design

---

### 3.2 Input Processing Layer
Handles data capture and preprocessing:

- OCR via Google ML Kit
- Speech-to-text via ML Kit
- Clipboard monitoring via Android APIs
- Screen capture via MediaProjection API

---

### 3.3 NLP & AI Processing

#### Embedding Layer
- IndicBERT for Hindi/Tamil text understanding

#### Fake Pattern Classifier
- LSTM model for contextual pattern detection
- SVM classifier for fast binary classification

---

### 3.4 Claim Verification Engine

Uses Retrieval-Augmented Generation (RAG):

1. Extract claim from message
2. Query trusted sources
3. Retrieve verified information
4. Generate proof-based explanation

Trusted sources include:
- PIB India
- MoHFW
- India.gov.in
- WHO
- Fact-check platforms

---

### 3.5 Fraud Call Detection Architecture

#### Layer 1: Caller Intelligence
- Check scam number database
- Community-reported fraud numbers

#### Layer 2: Speech Analysis
- Convert call audio to text
- Detect scam phrases and urgency patterns

#### Layer 3: Risk Scoring
- Combine number data + speech analysis
- Display live fraud alert

Processing occurs on-device to ensure privacy.

---

### 3.6 AI Chatbot Architecture

The chatbot uses RAG architecture:

User Query  
↓  
Text embedding  
↓  
Retrieve verified sources  
↓  
Generate response grounded in trusted data  

This prevents hallucination and ensures factual responses.

---

## 4. Data Flow Pipeline

1. User inputs text/image/voice
2. Input converted to text
3. Text embedded using IndicBERT
4. Fake pattern classifier evaluates risk
5. Claims verified against trusted sources
6. Decision engine assigns risk score
7. Explanation generated
8. Result displayed via overlay & voice output

---

## 5. Database Design (MongoDB)

### Collections:

**Users**
- preferences
- consent flags
- language settings

**Reports**
- fraud reports
- fake news submissions
- geolocation & timestamps

**VerifiedSources**
- trusted source index
- embedded content snippets

**Analytics**
- regional fraud trends
- misinformation heatmaps

**Feedback**
- user ratings
- corrections for model improvement

Sensitive call data is anonymized.

---

## 6. Technology Stack

### Mobile App
- Kotlin (Android native)

### AI & NLP
- IndicBERT (Transformers)
- LSTM & SVM classifiers
- TensorFlow Lite (on-device inference)

### Processing
- Google ML Kit (OCR, STT, TTS)

### Backend
- FastAPI (Python)
- MongoDB database

### Cloud Infrastructure
- AWS Serverless (Lambda, API Gateway)
- India-region deployment for low latency

---

## 7. Security & Privacy Design

- On-device processing for sensitive data
- No storage of call audio
- User consent required for accessibility features
- Data encryption during sync
- Compliance with Indian IT Act

---

## 8. Scalability Considerations

- Modular microservice architecture
- Serverless backend for scaling
- Language model expansion capability
- Community reporting improves regional accuracy

---

## 9. Offline Functionality

- Cached verification results
- Local AI inference
- Sync when internet available

---

## 10. Future Architecture Enhancements

- WhatsApp bot verification
- Blockchain-based fact verification
- AI rumor trend prediction
- Integration with government safety systems
