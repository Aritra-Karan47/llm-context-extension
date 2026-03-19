# llm-context-extension
# URL to Markdown MVP

## Local Setup & Run
1. Install deps: `pip install -r requirements.txt`
2. Download ChromeDriver: Auto-handled by webdriver_manager.
3. Run: `python main.py` (or `uvicorn main:app --reload`)
4. Open: http://localhost:8000
5. Test: Enter URL, submit → Downloads .md file.

## Testing
- Static: https://example.com
- Dynamic: https://quotes.toscrape.com/js/ (JS-loaded)
- AI Chat: Find public share (e.g., search "shared ChatGPT" on Google), paste link.

## Serverless Deployment (AWS Lambda)
1. Install AWS SAM CLI.
2. Create `template.yaml`:
   ```yaml
   AWSTemplateFormatVersion: '2010-09-09'
   Transform: AWS::Serverless-2016-10-31
   Resources:
     ScraperFunction:
       Type: AWS::Serverless::Function
       Properties:
         CodeUri: .
         Handler: main.handler
         Runtime: python3.12
         Events:
           Api:
             Type: Api
             Properties:
               Path: /{proxy+}
               Method: ANY
         Layers:  # Add Chrome layer
           - !Ref ChromeLayer
         Environment:
           Variables:
             CHROME_BIN: /opt/chrome/chrome