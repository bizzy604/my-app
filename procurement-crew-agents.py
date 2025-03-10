import os
from crewai import Agent, Task, Crew
from langchain.llms import OpenAI
from langchain_anthropic import ChatAnthropic



class ProcurementAgentSystem:
    def __init__(self, api_key: str):
        # Initialize the language model
        # self.llm = OpenAI(api_key=api_key, temperature=0.7)
        self.llm = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"), temperature=0.7)
        
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
    
    def create_procurement_workflow(self, bid_details: Dict):
        # Initial Screening Task
        initial_screening_task = Task(
            description=f'''Conduct initial screening of the bid with the following details:
            - Project Amount: {bid_details.get('amount', 'N/A')}
            - Project Completion Time: {bid_details.get('completion_time', 'N/A')}
            - Vendor Documents: {bid_details.get('documents', 'N/A')}
            
            Evaluate if the bid meets the basic requirements and calculate initial screening score.
            Determine if the bid should proceed to further evaluation.''',
            agent=self.initial_screening_agent,
            expected_output='''A detailed report including:
            - Initial screening score
            - Basic requirements compliance status
            - Recommendation for further processing'''
        )
        
        # Compliance Task
        compliance_task = Task(
            description='''Conduct a thorough compliance check on the bid.
            Verify all legal and organizational compliance requirements.
            Identify any potential compliance issues.''',
            agent=self.compliance_agent,
            expected_output='''A comprehensive compliance report including:
            - Full legal compliance status
            - Any identified compliance risks
            - Detailed compliance score'''
        )
        
        # Risk Assessment Task
        risk_assessment_task = Task(
            description='''Perform a comprehensive risk assessment of the bid.
            Analyze financial, operational, and strategic risks associated with the bid.''',
            agent=self.risk_assessment_agent,
            expected_output='''A detailed risk assessment report including:
            - Identified risks
            - Risk severity
            - Mitigation recommendations'''
        )
        
        # Comparative Analysis Task
        comparative_analysis_task = Task(
            description='''Conduct a detailed comparative analysis of shortlisted bids.
            Compare technical proposals, vendor experience, and document fitness.
            Calculate average scores for comparison.''',
            agent=self.comparative_analysis_agent,
            expected_output='''A comprehensive comparative analysis report including:
            - Detailed score breakdown
            - Comparative strengths and weaknesses
            - Ranking of shortlisted bids'''
        )
        
        # Award Recommendation Task
        award_recommendation_task = Task(
            description='''Synthesize all previous analyses to provide a final recommendation.
            Determine the most suitable vendor for tender award based on comprehensive evaluation.''',
            agent=self.award_recommendation_agent,
            expected_output='''Final recommendation report including:
            - Recommended vendor
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
            max_rpm=30
        )
        
        return procurement_crew
    
    def process_bid(self, bid_details: Dict):
        # Create and execute the procurement workflow
        procurement_workflow = self.create_procurement_workflow(bid_details)
        result = procurement_workflow.kickoff()
        return result

# Example Usage
def main():
    # Initialize the system (replace with actual OpenAI API key)
    procurement_agent_system = ProcurementAgentSystem(api_key='your-openai-api-key')
    
    # Example bid details
    bid_details = {
        'amount': '500,000 USD',
        'completion_time': '6 months',
        'documents': ['Technical Proposal', 'Financial Proposal', 'Company Profile']
    }
    
    # Process the bid
    result = procurement_agent_system.process_bid(bid_details)
    print(result)

if __name__ == '__main__':
    main()
