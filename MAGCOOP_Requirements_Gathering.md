# MAGCOOP Digital Loans Platform - Requirements Gathering Document

## Executive Summary

This document is designed to gather comprehensive requirements from MAGCOOP for the development of a digital loans application platform. Your detailed responses will directly shape the features, workflows, and user experience of the platform.

**Instructions for Completion:**
- Please complete all sections thoroughly
- Mark priorities as High/Medium/Low
- Provide specific examples where requested
- Highlight any regulatory or compliance requirements
- Note any existing systems that need integration

---

## Section 1: Loan Type Prioritization

Please rank your loan products by implementation priority and provide current operational metrics:

| Loan Type | Priority (1-14) | Monthly Volume | Avg Processing Time | Ready for Digital? | Notes |
|-----------|----------------|----------------|-------------------|-------------------|--------|
| Business Loan | ___ | ___ loans | ___ days | Yes/No/Partial | |
| Car Loan | ___ | ___ loans | ___ days | Yes/No/Partial | |
| Regular Loan (Max ₱500K) | ___ | ___ loans | ___ days | Yes/No/Partial | |
| Housing Loan | ___ | ___ loans | ___ days | Yes/No/Partial | |
| Microfinance Loan | ___ | ___ loans | ___ days | Yes/No/Partial | |
| Mobile Post-Paid Plan | ___ | ___ loans | ___ days | Yes/No/Partial | |
| Motorcycle Loan | ___ | ___ loans | ___ days | Yes/No/Partial | |
| MagHealthy Loan (0% interest) | ___ | ___ loans | ___ days | Yes/No/Partial | |
| Educational Loan (0% interest) | ___ | ___ loans | ___ days | Yes/No/Partial | |
| Share-Guaranty Loan (0% interest) | ___ | ___ loans | ___ days | Yes/No/Partial | |
| Emergency Loan (0% interest) | ___ | ___ loans | ___ days | Yes/No/Partial | |
| Study Now, Pay Later | ___ | ___ loans | ___ days | Yes/No/Partial | |
| Train Now, Pay Later | ___ | ___ loans | ___ days | Yes/No/Partial | |
| Tuition Fee Installment | ___ | ___ loans | ___ days | Yes/No/Partial | |

---

## Section 2: Data Requirements for Priority Loans

For your **TOP 5 PRIORITY** loan types, please complete the following:

### Loan Type: ________________

#### A. Member Information Required
| Field Name | Data Type | Required? | Validation Rules | Source System |
|------------|-----------|-----------|------------------|---------------|
| Member ID | Number | Yes/No | | |
| Full Name | Text | Yes/No | | |
| Date of Birth | Date | Yes/No | Min age: ___ | |
| Employment Status | Dropdown | Yes/No | Options: _______ | |
| Monthly Income | Currency | Yes/No | Min: ___ Max: ___ | |
| | | | | |
| _(Add more rows as needed)_ | | | | |

#### B. Document Requirements
| Document Type | Format Accepted | Max File Size | Mandatory? | Verification Method |
|---------------|-----------------|---------------|------------|-------------------|
| Valid ID | PDF/JPG/PNG | ___MB | Yes/No | Manual/Auto/Both |
| Proof of Income | PDF/JPG/PNG | ___MB | Yes/No | Manual/Auto/Both |
| | | | | |
| _(Add more rows as needed)_ | | | | |

#### C. Loan Parameters
| Parameter | Value/Range | Business Rule |
|-----------|-------------|---------------|
| Minimum Amount | ₱_______ | |
| Maximum Amount | ₱_______ | |
| Interest Rate | ___% | Fixed/Variable? |
| Processing Fee | ₱_____ or ___% | |
| Payment Terms | ___ to ___ months | |
| Collateral Required | Yes/No | If yes, types: _____ |
| Co-maker Required | Yes/No | If yes, how many: ___ |

#### D. Approval Workflow
| Stage | Responsible Party | SLA (Hours/Days) | Actions Available | Escalation Rule |
|-------|------------------|------------------|-------------------|-----------------|
| 1. Application Submission | Member | | Submit/Save Draft | |
| 2. Initial Review | | | Approve/Reject/Return | |
| 3. | | | | |
| _(Add stages as needed)_ | | | | |

*(Repeat Section 2 for each of your top 5 priority loan types)*

---

## Section 3: Critical Business Questions

### User Access & Eligibility
1. **Member vs Non-Member Access:**
   - Should non-members be able to apply for loans through the digital platform? Yes/No
   - If yes, which loan types should be available to non-members? _______________________
   - What is the process for non-members to become members during loan application? _______________________
   - Should there be different interest rates or terms for non-members? Yes/No - Details: _______________________

2. **Digital Application Scope:**
   - Of your 14 loan products, how many do you expect to be available for online application initially? ___
   - Please list which specific loans should be available online: _______________________
   - Are there any loans that should NEVER be available online? Yes/No - Which ones and why: _______________________
   - Do online application offerings differ for members vs non-members? Yes/No - How: _______________________

3. **Loan Popularity & Phased Approach:**
   - What are your TOP 3 most popular loan types by volume?
     1. _________________ (___% of total volume)
     2. _________________ (___% of total volume)  
     3. _________________ (___% of total volume)
   - What are your 3 LEAST popular loan types?
     1. _________________ 
     2. _________________
     3. _________________
   - Would you prefer to launch with just 1-2 loan types initially to refine processes? Yes/No
   - If yes, which 1-2 loan types would you choose for initial launch? _______________________
   - What is your preferred timeline for adding additional loan types after initial launch? _______________________

### Requirements Definition & Resources
4. **Data Field Definition:**
   - Who will be responsible for defining all required data fields for each loan type? 
     - Name: _________________ Position: _________________
   - Do you have existing documentation that lists all fields required for each loan? Yes/No
   - If yes, in what format? _______________________
   - What resources (people/time) can you allocate to defining these requirements? _______________________
   - Do you have a legal/compliance team that needs to review field requirements? Yes/No - Contact: _______________________

5. **Loan Type Variations:**
   - Do you have a comparison matrix showing differences between loan types? Yes/No
   - What are the key differentiators between your loan products? (check all that apply):
     - [ ] Interest rates
     - [ ] Required documents
     - [ ] Eligibility criteria
     - [ ] Approval process
     - [ ] Collateral requirements
     - [ ] Maximum amounts
     - [ ] Payment terms
     - [ ] Other: _________________
   - How often do loan requirements/terms change? _______________________
   - Who has authority to modify loan parameters in the system? _______________________

### Credit Assessment & Risk Management
6. **Credit Scoring:**
   - Do you use credit bureau data? Yes/No - If yes, which: ________________
   - Internal credit scoring factors (check all that apply):
     - [ ] Payment history with MAGCOOP
     - [ ] Share capital amount
     - [ ] Length of membership
     - [ ] Employment stability
     - [ ] Other: ________________
   - Different scoring criteria for members vs non-members? Yes/No - Details: _______________________
   
7. **Risk Assessment:**
   - Maximum debt-to-income ratio allowed: ____%
   - How do you calculate loan capacity? _______________________
   - Blacklist criteria: _______________________
   - Do you require guarantors/co-makers? For which loans: _______________________

### Disbursement & Collection
8. **Loan Disbursement:**
   - Methods available (check all):
     - [ ] Bank transfer
     - [ ] Check
     - [ ] Cash
     - [ ] Digital wallet (specify): ________
     - [ ] Other: ________
   - Typical disbursement timeline after approval: ____ hours/days
   - Different disbursement methods for different loan types? Yes/No - Details: _______________________

9. **Payment Collection:**
   - Accepted payment channels:
     - [ ] Salary deduction
     - [ ] Bank auto-debit
     - [ ] Over-the-counter
     - [ ] Online banking
     - [ ] Mobile payment apps
     - [ ] Other: ________
   - Late payment grace period: ____ days
   - Penalty calculation: _______________________
   - Different collection methods for members vs non-members? Yes/No - Details: _______________________

### Compliance & Reporting
10. **Regulatory Requirements:**
    - Regulatory bodies you report to: _______________________
    - Required reports and frequency: _______________________
    - Data retention period required: ____ years
    - Audit trail requirements: _______________________
    - Different compliance requirements for online vs in-person applications? Yes/No - Details: _______________________

11. **Member Communication:**
    - Preferred notification channels:
      - [ ] SMS
      - [ ] Email  
      - [ ] In-app notification
      - [ ] Other: ________
    - Required notifications (e.g., approval, due date reminders): _______________________
    - Different communication preferences for members vs non-members? Yes/No - Details: _______________________

---

## Section 4: Process Pain Points & Improvements

### Current Challenges
Please rate the severity of these common challenges (1=Not an issue, 5=Critical issue):

| Challenge | Rating (1-5) | Specific Examples |
|-----------|-------------|-------------------|
| Long processing times | ___ | |
| Document verification delays | ___ | |
| Manual data entry errors | ___ | |
| Member follow-ups for missing docs | ___ | |
| Approval bottlenecks | ___ | |
| Payment tracking issues | ___ | |
| Reporting difficulties | ___ | |
| Other: _____________ | ___ | |

### Desired Features
Please prioritize these potential features (High/Medium/Low/Not Needed):

| Feature | Priority | Additional Requirements |
|---------|----------|------------------------|
| Mobile app for members | | iOS/Android/Both? |
| Real-time application status tracking | | |
| Automated document verification | | |
| E-signature capability | | |
| Loan calculator/simulator | | |
| Automated credit scoring | | |
| Bulk processing for payroll loans | | |
| API for corporate partners | | |
| Analytics dashboard | | |
| Automated reminder system | | |
| Online payment gateway | | |
| Document template library | | |

---

## Section 5: Success Metrics

What would make this digital platform successful for MAGCOOP?

1. **Efficiency Gains:**
   - Target reduction in processing time: From ___ days to ___ days
   - Target reduction in manual work: ____%
   - Expected cost savings: ₱_____ per month/year

2. **Member Experience:**
   - Target loan application completion time: ___ minutes
   - Expected increase in loan applications: ____%
   - Member satisfaction target: ___/10

3. **Business Growth:**
   - Expected increase in loan portfolio: ____%
   - New market segments to target: _______________________
   - Cross-sell opportunities: _______________________

---

## Section 6: Implementation Preferences

1. **Rollout Strategy:**
   - [ ] Big bang (all loans at once)
   - [ ] Phased by loan type
   - [ ] Pilot with select members
   - [ ] Gradual migration
   
2. **Training Requirements:**
   - Number of staff to train: ___
   - Preferred training method: Online / In-person / Hybrid
   - Training duration tolerance: ___ days

3. **Timeline Expectations:**
   - Expected go-live for first loan type: ___ months
   - Full implementation target: ___ months

---

## Additional Comments

Please provide any additional information, specific requirements, or concerns not covered above:

_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

**Contact Information for Follow-up Questions:**
- Primary Contact: ________________
- Email: ________________
- Phone: ________________
- Best time to reach: ________________

**Document Completed by:**
- Name: ________________
- Position: ________________
- Date: ________________

---

*Thank you for taking the time to complete this requirements document. Your detailed responses will ensure the digital loans platform meets MAGCOOP's specific needs and delivers maximum value to your members.*