import os
import sys
import json
from typing import Dict, List, Optional, Any
from crewai import Agent, Task, Crew
from langchain_anthropic import ChatAnthropic

class ProcurementAgentSystem:
    def __init__(self, api_key: Optional[str] = None):
        # Initialize the language model
        self.llm = ChatAnthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY") or api_key, 
            temperature=0.7,
            model_name="claude-3-haiku-20240307"
        )
        
        # Define Agents
        self.initial_screening_agent = self.create_initial_screening_agent()
        self.compliance_agent = self.create_compliance_agent()
        self.risk_assessment_agent = self.create_risk_assessment_agent()
        self.comparative_analysis_agent = self.create_comparative_analysis_agent()
        self.award_recommendation_agent = self.create_award_recommendation_agent()
    
    def create_initial_screening_agent(self):
        return Agent(
            role='Procurement Bid Initial Screening Specialist',
            goal='Conduct initial screening of vendor bids to ensure basic requirements are met',
            backstory='''You are a meticulous procurement specialist trained to review initial bid submissions. 
            Your primary focus is to quickly identify bids that meet the basic criteria and filter out 
            those that do not comply with initial requirements.''',
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_compliance_agent(self):
        return Agent(
            role='Procurement Compliance Auditor',
            goal='Ensure all bids fully comply with legal and organizational requirements',
            backstory='''You are a rigorous compliance expert specializing in examining procurement bids. 
            Your role is to meticulously check every aspect of the bid against regulatory and 
            organizational compliance standards.''',
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_risk_assessment_agent(self):
        return Agent(
            role='Procurement Risk Analyst',
            goal='Identify and evaluate potential risks associated with each bid',
            backstory='''You are a strategic risk assessment specialist who thoroughly analyzes 
            potential risks in procurement bids. Your insights help minimize potential 
            financial and operational risks for the organization.''',
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_comparative_analysis_agent(self):
        return Agent(
            role='Procurement Bid Comparative Analyst',
            goal='Conduct comprehensive comparative analysis of shortlisted bids',
            backstory='''You are an expert in detailed bid comparison, capable of analyzing 
            multiple dimensions of vendor proposals. Your analysis provides a holistic view 
            of the strengths and weaknesses of each bid.''',
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_award_recommendation_agent(self):
        return Agent(
            role='Procurement Award Recommendation Specialist',
            goal='Provide a final recommendation for tender award based on comprehensive analysis',
            backstory='''You are the final decision support agent who synthesizes all previous 
            analyses to recommend the most suitable vendor for the tender award.''',
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )
    
    def create_procurement_workflow(self, bid_details: Dict[str, Any]):
        # Initial Screening Task
        initial_screening_task = Task(
            description=f'''Conduct initial screening of the bid with the following details:
            - Project Amount: {bid_details.get('amount', 'N/A')}
            - Project Completion Time: {bid_details.get('completion_time', 'N/A')}
            - Technical Proposal: {bid_details.get('technical_proposal', 'N/A')[:500]}...
            - Vendor Experience: {bid_details.get('vendor_experience', 'N/A')[:500]}...
            
            Evaluate if the bid meets the basic requirements and calculate initial screening score.
            Determine if the bid should proceed to further evaluation.
            
            Provide a score out of 100 and a detailed report.''',
            agent=self.initial_screening_agent,
            expected_output='''A detailed report including:
            - Initial screening score (0-100)
            - Basic requirements compliance status
            - Recommendation for further processing'''
        )
        
        # Compliance Task
        compliance_task = Task(
            description=f'''Conduct a thorough compliance check on the bid with:
            - Documents: {', '.join([d.get('name', 'Unknown') for d in bid_details.get('documents', [])])}
            - Budget Compliance: Bid amount {bid_details.get('amount')} vs Tender budget {bid_details.get('tender', {}).get('budget')}
            
            Verify all legal and organizational compliance requirements.
            Identify any potential compliance issues.
            
            Provide a score out of 100 and a detailed report.''',
            agent=self.compliance_agent,
            expected_output='''A comprehensive compliance report including:
            - Compliance score (0-100)
            - Full legal compliance status
            - Any identified compliance risks
            - Detailed compliance assessment'''
        )
        
        # Risk Assessment Task
        risk_assessment_task = Task(
            description=f'''Perform a comprehensive risk assessment of the bid considering:
            - Financial risks: Bid amount, payment terms
            - Operational risks: Completion time, technical approach
            - Vendor risks: Experience ({bid_details.get('vendor_experience', 'N/A')[:300]}...)
            
            Analyze all potential risks associated with the bid.
            
            Provide a score out of 100 (higher is better/less risky) and a detailed report.''',
            agent=self.risk_assessment_agent,
            expected_output='''A detailed risk assessment report including:
            - Risk score (0-100, higher is better/less risky)
            - Identified risks
            - Risk severity
            - Mitigation recommendations'''
        )
        
        # Comparative Analysis Task
        comparative_analysis_task = Task(
            description=f'''Conduct a detailed comparative analysis of this bid relative to:
            - Tender requirements: {bid_details.get('tender', {}).get('requirements', [])}
            - Technical aspects: Quality of technical proposal
            - Financial aspects: Value for money assessment
            
            Compare technical proposal, vendor experience, and document fitness.
            Calculate comparative score for evaluation.
            
            Provide a score out of 100 and a detailed report.''',
            agent=self.comparative_analysis_agent,
            expected_output='''A comprehensive comparative analysis report including:
            - Comparative score (0-100)
            - Detailed score breakdown
            - Comparative strengths and weaknesses'''
        )
        
        # Award Recommendation Task
        award_recommendation_task = Task(
            description=f'''Synthesize all previous analyses to provide a final recommendation for:
            - Bid ID: {bid_details.get('id')}
            - Vendor: {bid_details.get('bidder', {}).get('company')}
            - Bid Amount: {bid_details.get('amount')}
            
            Determine if this bid should be recommended for tender award based on comprehensive evaluation.
            
            Provide a recommendation score out of 100 and a detailed justification report.''',
            agent=self.award_recommendation_agent,
            expected_output='''Final recommendation report including:
            - Recommendation score (0-100)
            - Clear recommendation (yes/no)
            - Justification for recommendation
            - Key supporting evidence'''
        )
        
        # Create Crew with Sequential Workflow
        procurement_crew = Crew(
            agents=[
                self.initial_screening_agent,
                self.compliance_agent,
                self.risk_assessment_agent,
                self.comparative_analysis_agent,
                self.award_recommendation_agent
            ],
            tasks=[
                initial_screening_task,
                compliance_task,
                risk_assessment_task,
                comparative_analysis_task,
                award_recommendation_task
            ],
            verbose=2,
            memory=True,
            max_rpm=10
        )
        
        return procurement_crew
    
    def process_bid(self, bid_details: Dict[str, Any]) -> Dict[str, Any]:
        # Create and execute the procurement workflow
        procurement_workflow = self.create_procurement_workflow(bid_details)
        raw_results = procurement_workflow.kickoff()
        
        # Parse results into structured format
        results = {
            "initial_screening": self._parse_agent_output(raw_results[0]),
            "compliance": self._parse_agent_output(raw_results[1]),
            "risk_assessment": self._parse_agent_output(raw_results[2]),
            "comparative_analysis": self._parse_agent_output(raw_results[3]),
            "award_recommendation": self._parse_agent_output(raw_results[4], parse_recommendation=True)
        }
        
        return results
    
    def _parse_agent_output(self, text: str, parse_recommendation: bool = False) -> Dict[str, Any]:
        """Parse agent output to extract score and report"""
        score_pattern = r"score:?\s*(\d+)"
        import re
        
        score_match = re.search(score_pattern, text.lower())
        score = int(score_match.group(1)) if score_match else 50
        
        # Limit score to 0-100 range
        score = max(0, min(score, 100))
        
        result = {
            "score": score,
            "report": text
        }
        
        if parse_recommendation:
            # Check if recommendation is positive
            positive_indicators = ["recommend", "award", "approve", "accept", "yes", "positive"]
            negative_indicators = ["reject", "decline", "not recommend", "do not recommend", "no", "negative"]
            
            recommendation_positive = any(term in text.lower() for term in positive_indicators)
            recommendation_negative = any(term in text.lower() for term in negative_indicators)
            
            # If positive indicators are found and no negative indicators, or score is high
            result["recommended"] = (recommendation_positive and not recommendation_negative) or score >= 80
        
        return result

def main():
    if len(sys.argv) != 3:
        print("Usage: python procurement-crew-agents.py <input_file> <output_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # Read input data
    try:
        with open(input_file, 'r') as f:
            bid_data = json.load(f)
    except Exception as e:
        print(f"Error reading input file: {e}")
        sys.exit(1)
    
    # Initialize agent system
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("Warning: ANTHROPIC_API_KEY environment variable not set")
    
    procurement_system = ProcurementAgentSystem(api_key=api_key)
    
    # Process the bid
    try:
        results = procurement_system.process_bid(bid_data)
        
        # Write results to output file
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"Analysis complete. Results written to {output_file}")
    except Exception as e:
        print(f"Error during processing: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 